const express = require('express');

// ejs is a template library
// it allows us to store html in a file and then send it as back as response
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const app = express();

// read in our .env file
require("dotenv").config();
const { createPool } = require('mysql2/promise');

app.use(expressLayouts)

// tell Express that we are using ejs
app.set("view engine", "ejs");

// tell EJS which layout to use
app.set('layout', 'layouts/base')

// enable form submission via browser
app.use(express.urlencoded({
    extended: true
}));

// creat a connection pool
const connection = createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT

    }
)

app.get('/', function (req, res) {

    const todayDate = new Date().toLocaleDateString("en-GB");
    res.render("home", {
        "todayDate": todayDate
    });

});

app.get('/customers', async function (req, res) {

    const firstName = req.query.first_name;
    const lastName = req.query.last_name;
    const email = req.query.email;

    let sql = `
        SELECT * FROM Customers
            JOIN Companies ON
                Customers.company_id = Companies.company_id
        WHERE 1
    `

    const bindings = [];

    if (firstName) {
        sql += ' AND first_name LIKE ?';
        bindings.push('%' + firstName + '%');
    }

    if (lastName) {
        sql += ' AND last_name LIKE ?';
        bindings.push('%' + lastName + '%');
    }

    if (email) {
        sql += ' AND email LIKE ?';
        bindings.push('%' + email + '%');
    }

    sql += ' ORDER BY Customers.first_name, Customers.last_name';

    const [customers] = await connection.query({
        "sql": sql,
        "nestTables": true
    }, bindings);

    res.render('customers/index', {
        customers: customers,
        searchParams: req.query
    })
})

// one route to display the form
app.get('/customers/create', async function (req, res) {
    const [companies] = await connection.execute("SELECT * FROM Companies");
    const [employees] = await connection.execute("SELECT * FROM Employees");

    const [products] = await connection.execute("SELECT * FROM Products");

    res.render('customers/create', {
        companies, employees, products
    })
})

// one route to process the form
app.post('/customers/create', async function (req, res) {
    console.log(req.body);

    const conn = await connection.getConnection();

    try {
        await conn.beginTransaction();

        const sql = `
        INSERT INTO Customers (first_name, last_name, email, company_id, employee_id)
            VALUES (?, ?, ?, ?, ?);
    `
        const [results] = await connection.execute(sql, [
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.company_id,
            req.body.employee_id
        ]);

        const newCustomerId = results.insertId;

        if (Array.isArray(req.body.products)) {
            for (let p of req.body.products) {
                const sql = `INSERT INTO CustomerProduct (customer_id, product_id) VALUES (?, ?)`;
                await connection.execute(sql, [newCustomerId, p]);
            }
        }

        await conn.commit();

    } catch (e) {
        await conn.rollback();
    } finally {
        await conn.release();
    }

    res.redirect('/customers')
})

// confirm with the user if they want to delete
app.get('/customers/:customer_id/delete', async function (req, res) {
    const [customers] = await connection.execute(
        "SELECT * FROM Customers where customer_id = ?", [req.params.customer_id]);

    const customer = customers[0];

    res.render('customers/delete', {
        customer
    })
})

// process the delete
app.post('/customers/:customer_id/delete', async function (req, res) {
    const conn = await connection.getConnection();

    try {
        await conn.beginTransaction();

        await connection.execute("DELETE FROM CustomerProduct WHERE customer_id = ?", [req.params.customer_id])

        const sql = `DELETE FROM Customers WHERE customer_id = ?`;
        await connection.execute(sql, [req.params.customer_id]);

        await conn.commit();
    } catch (e) {
        await conn.rollback();
    } finally {
        await conn.release();
    }

    res.redirect('/customers')
})

// one route to display the edit form
app.get('/customers/:customer_id/update', async function (req, res) {
    const [customers] = await connection.execute(
        "SELECT * FROM Customers where customer_id = ?", [req.params.customer_id]);

    const customer = customers[0];

    const [companies] = await connection.execute("SELECT * FROM Companies");
    const [employees] = await connection.execute("SELECT * FROM Employees");
    const [products] = await connection.execute("SELECT * FROM Products");
    const [selectedProductResults] = await connection.execute(
        "SELECT * FROM CustomerProduct WHERE customer_id = ?", [req.params.customer_id])
    const selectedProducts = selectedProductResults.map(function (p) {
        return p.product_id;
    })
    console.log(selectedProducts);

    res.render('customers/edit', {
        customer, companies, employees, products, selectedProducts
    })
})

// one route to process the form
app.post('/customers/:customer_id/update', async function (req, res) {

    const conn = await connection.getConnection();
    try {
        await conn.beginTransaction();
        const { first_name, last_name, email, company_id, employee_id } = req.body;

        const sql = `UPDATE Customers SET
                        first_name = ?,
                        last_name = ?,
                        email = ?,
                        company_id = ?,
                        employee_id = ?
                   WHERE customer_id = ?
                  `;

        await connection.execute(sql, [first_name, last_name, email, company_id, employee_id, req.params.customer_id]);

        await conn.execute("DELETE FROM CustomerProduct WHERE customer_id = ?", [req.params.customer_id]);

        for (let p of req.body.products) {
            await conn.execute(`INSERT INTO CustomerProduct (customer_id, product_id) VALUES (?, ?)`,
                [req.params.customer_id, p]
            )
        }

        await conn.commit();
    } catch (e) {
        await conn.rollback();
    } finally {
        await conn.release();
    }

    res.redirect('/customers')
})

app.listen(3000, function () {
    console.log("Server started");
})

