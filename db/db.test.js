const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Linux7631',
    database: 'dbms'
});

const sql = 'SELECT * FROM `teacher`';

connection.query(sql, (error, result) => {
    console.log(result);
});

connection.end();