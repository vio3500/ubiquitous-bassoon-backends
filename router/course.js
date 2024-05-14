const express = require('express');
const router = express.Router()
const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Linux7631',
    database: 'dbms'
})

router.get('/:teacher_id', (req, res) => {
    const teacher_id = req.params.teacher_id
    connection.query('select * from course where teacher_id=${teacher_id}', (error, result) => {
        res.send(result);
    })
})

module.exports = router