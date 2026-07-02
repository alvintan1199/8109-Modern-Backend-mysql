CREATE TABLE parents (
    parent_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(45) NOT NULL,
    last_name VARCHAR(45)
) ENGINE = INNODB;

SHOW TABLES;

CREATE TABLE students (
    student_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    parent_id INT UNSIGNED NOT NULL,
    first_name VARCHAR(45) NOT NULL,
    last_name VARCHAR(45),
    dob DATETIME NOT NULL,
    swimming_level TINYINT NOT NULL
) ENGINE = INNODB;

-- add a constraint
-- the constraint that we are adding is the foreign key relationship
ALTER TABLE students
    ADD CONSTRAINT fk_parents_students
    FOREIGN KEY(parent_id) REFERENCES parents(parent_id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;

-- DML : insert row
INSERT INTO parents (first_name, last_name) VALUES ("Ah Kow", "Tan");

-- DML: insert a row with the foreign key dependency
INSERT INTO students (parent_id, first_name, last_name, dob, swimming_level) VALUES (2, "Ah Mew", "Tan", "2020-06-09", 1);


CREATE TABLE locations (
    location_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    address VARCHAR(255) NOT NULL,
    open_at TIME,
    close_at TIME
) ENGINE = INNODB;

-- How to change a table
-- ALTER TABLE <table name> ADD COLUMN <name of new column> <data type> <options>
ALTER TABLE locations ADD COLUMN name VARCHAR(255) NOT NULL;

-- How to modify a column
ALTER TABLE locations MODIFY COLUMN address VARCHAR(1000) NOT NULL;

-- Drop columns (delete columns)
ALTER TABLE locations DROP COLUMN open_at;
ALTER TABLE locations DROP COLUMN close_at;

-- ALTER TABLE is subjected to constraints ()



-- DML : insert row
INSERT INTO parents (first_name, last_name) VALUES ("Ah Kow", "Tan");

-- DML: insert a row with the foreign key dependency
INSERT INTO students (parent_id, first_name, last_name, dob, swimming_level) VALUES (2, "Ah Mew", "Tan", "2020-06-09", 1);

-- Insert multiple rows at the same time
INSERT INTO parents (first_name, last_name) VALUES ("Jon", "Snow"), ("Adam", "Smith"), ("Tony", "Stare");

-- Update a table
-- UPDATE <name of table> SET <col1>=<value1>, <col2>=<value2> ..... WHERE <cond>
UPDATE parents SET first_name="John" WHERE parent_id = 3;

-- DELETE FROM <parents> WHERE <cond>
DELETE FROM parents WHERE parent_id = 3;
