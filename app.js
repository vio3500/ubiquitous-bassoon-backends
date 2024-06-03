const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors({
    origin: ''
}))

const mysql = require('mysql2/promise');
db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '@Linux7631',
    database: 'dbms'
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const {setToken, tokenAuth, decodeJwt} = require('./tokenAuth')

// 1.注册接口
app.post('/teachers/register', async (req, res) => {
    const {username, password} = req.body;
    await db.execute(`
    INSERT INTO teacher(username, password)
    VALUES (?, ?)
    `, [username, password]
    );
    res.json({code:0})
})

// 2.登录接口
app.post('/teachers/login', async (req, res) => {
    const {username, password} = req.body;
    let [teacher] = await db.execute(`
    SELECT id
    FROM teacher
    WHERE username=? AND password=?
    `, [username, password]
    )
    if (teacher.length === 0) {
        return res.send('Access denied: Incorrect username or password')
    }
    res.send({
        token: setToken({id: teacher[0].id}),
    })
})

// 3. 获取课程
app.get('/courses', decodeJwt, async (req, res) => {
    const teacherId = res.locals.teacherId;
    const [courses] = await db.execute(`
    SELECT id, name
    FROM course
    WHERE teacher_id = ? AND is_deleted = 0
    `, [teacherId]
    )
    res.json(courses)
})

// 4. 添加课程
app.post('/courses', decodeJwt, async (req, res) => {
    const teacherID = res.locals.teacherId;
    const {name: courseName} = req.body
    await db.execute(`
    INSERT INTO course(name, teacher_id)
    VALUES(?, ?)`, [courseName, teacherID]
    );
    res.json({code:0})
})

// 5. 删除课程
app.delete('/courses/:courseID', tokenAuth, async(req,res) => {

})

const port = 5000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});