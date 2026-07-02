const express = require('express');

// ejs is a template library
// it allows us to store html in a file and then send it as back as response
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const app = express();

// read in our .env file
require("dotenv").config();
const {createPool} = require('mysql2/promise');

app.use(expressLayouts)

// tell Express that we are using ejs
app.set("view engine", "ejs");

// tell EJS which layout to use
app.set('layout', 'layouts/base')

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

app.get('/', function(req,res){

    const todayDate = new Date().toLocaleDateString("en-GB");
    // the first arg to res.render is the name 
    // of the ejs file to send back to the user
    // and it will be assumed to be in the views folder
    res.render("home", {
        "todayDate": todayDate
    });

});

app.get('/customers', async function(req,res){
    const sql = `
        SELECT * FROM Customers
            JOIN Companies ON
                Customers.company_id = Companies.company_id
        `
    // connection.query takes in the SQL statement as parameter
    // and returns an array of two elements
    // index 0 is the results
    // index 1 is some metadata
    const responses = await connection.query({
        "sql": sql,
        "nestTables": true
    });
    // res.send(responses[0]);
    console.log(responses[0])
    res.render('customers/index', {
        customers: responses[0]
    })
})

app.get('/customers/create', async function(req,res){
    res.render('customers/create')
})

app.listen(3000, function(){
    console.log("Server started");
})