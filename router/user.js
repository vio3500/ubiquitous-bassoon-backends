const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Linux7631',
    database: 'dbms'
});

router.get('/', (req, res) => {
    connection.query(sql, (error, result) => {
        res.send(result);
    })
});

const sql = 'SELECT * FROM `teacher`';

connection.query(sql, (error, result) => {
    console.log(result);
});

router.get('/', (req, res) => res.send('Hey bitch'));
router.post('/', (req, res) => {});
router.get('/:id', (req, res) => {});

module.exports = router;