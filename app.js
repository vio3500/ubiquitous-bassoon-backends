const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000'
}))

const mysql = require('mysql2/promise');
db = mysql.createPool({
    host: 'localhost',
    user: 'backend_access',
    password: 'password123456',
    database: 'teacher_helper_system_database'
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const {setToken, decodeJwt} = require('./tokenAuth')

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
    SELECT id, course_id, name
    FROM course
    WHERE teacher_id = ? AND is_deleted = 0
    `, [teacherId]
    )
    res.json(courses)
})

// 4. 添加课程
app.post('/courses', decodeJwt, async (req, res) => {
    const teacherID = res.locals.teacherId;
    const {
        course_id: CourseId,
        name: Name
    } = req.body
    await db.execute(`
    INSERT INTO course(course_id, name, teacher_id)
    VALUES(?, ?, ?)`, [CourseId, Name, teacherID]
    );
    res.json({code:0})
})

// 5. 删除课程
app.delete('/courses/:courseId', decodeJwt, async(req,res) => {
    const courseId = req.params.courseId
    await db.execute(`
    UPDATE course
    SET is_deleted = 1
    WHERE id = ?
    `,[courseId])
    res.json({code:0});
})

// 6. 获取学生
app.get('/courses/:courseId/students', decodeJwt, async(req, res) => {
    const {courseId} = req.params;
    const [students] = await db.execute(`
    SELECT id, name
    FROM student
    WHERE course_id = ? AND is_deleted = 0`, [courseId])
    res.json(students);
})

// 7. 添加学生
app.post('/courses/:courseId/students', decodeJwt, async (req, res) => {
    const {name: studentName} = req.body;
    const {courseId} = req.params;
    await db.execute(`
    INSERT INTO student(name, course_id)
    VALUES(?, ?)`, [studentName, courseId])
    res.json({code:0});
})

// 8. 删除学生
app.delete('/courses/:courseId/students/:studentId', decodeJwt, async (req, res) => {
    const {studentId} = req.params;
    await db.execute(`
    UPDATE student
    SET is_deleted = 1
    WHERE id = ? AND is_deleted = 0`, [studentId]);
    res.json({code:0});
})

// 9.添加课时
app.post('/courses/:courseId/classes', decodeJwt, async (req, res, next) => {
    const { courseId } = req.params;
    const { timestamp } = req.body; // timestamp should be in milliseconds
    const date = new Date(parseInt(timestamp));
    const formattedDate = date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    const session = date.getHours() < 12 ? 0 : 1;

    try {
        const [result] = await db.execute(`
            INSERT INTO class(course_id, date, session)
            VALUES(?, ?, ?)`, [courseId, formattedDate, session]);

        const classId = result.insertId; // Get the last inserted ID
        res.json({ code: 0, class_id: classId });
    } catch (error) {
        next(error);
    }
});


// 10. 获取课程的所有异常考勤
app.get('/courses/:courseId/attendances', decodeJwt, async(req, res) => {
    const {courseId} = req.params;
    const {attendances} = await db.execute(`
    SELECT stu.name, cls.date, clas.session, att.status
    FROM attendance att
    JOIN student stu ON stu.id = att.student_id
    JOIN class cls ON cls.id = att.student_id
    JOIN class cls ON cls.id = att.class_id
    WHERE att.course_id = ? AND att.status != 0
    ORDER BY cls.date, cls.session`, [courseId])
    res.json(attendances);
})

// 11. 获取一节课的考勤
app.get('/courses/:courseId/attendances/classes/:classId', decodeJwt, async(req, res) => {
    const {classId} = req.params;
    const [attendances] = await db.execute(`
    SELECT student_id, status
    FROM attendance
    WHERE class_id = ?`,[classId]);
    res.json(attendances)
})

// 12.添加考勤记录
app.post('/courses/:courseId/attendances/classes/:classId/students/:studentId', decodeJwt, async(req, res) => {
    const {courseId, classId, studentId} = req.params;
    const {status} = req.body
    await db.execute(`
    INSERT INTO attendance(course_id, class_id, student_id, status)
    VALUES(?, ?, ?, ?,)`, [courseId, classId, studentId, status])
    res.json({code:0});
})

// 13. 修改考勤记录
app.patch('/courses/:courseId/attendances/classes/:classId/students/:studentId', decodeJwt, async(req, res) => {
    const  {classId, studentId} = req.params;
    const {status} = req.body;
    await db.execute(`
    UPDATE attendance
    SET status = ?
    WHERE student_id = ? AND class_id = ?`, [status, studentId, classId]);
    res.json({code:0});
})

// 14. 获取课程的所有得分记录
app.get('/courses/:courseId/scores', decodeJwt, async(req, res) => {
    const {courseId} = req.params;
    const [scores] = await db.execute(`
    SELECT stu.name, cls.date, cls.session, sc.score
    FROM score sc JOIN student stu ON stu.id = sc.student_id
    JOIN class cls ON cls.id = sc.class_id
    WHERE sc.course_id = ?
    ORDER BY cls.date, cls.session`,[courseId])
    res.json(scores);
})

// 15. 获取一节课的所有学生的得分记录
app.get('/courses/:courseId/scores/classes/:classId', decodeJwt, async(req, res) => {
    const {classId} = req.params;
    const [scores] = await db.execute(`
    SELECT student_id, score
    FROM score
    WHERE class_id = ?
    `, [classId])
    res.json(scores)
})

// 16. 添加积分记录
app.post('/courses/:courseId/scores/classes/:classId/students/:studentId', decodeJwt, async(req, res) => {
    const { score } = req.body
    const { courseId, classId, studentId } = req.params;
    await db.execute(`
    INSERT INTO score (course_id, class_id, student_id, score)
    VALUES(?, ?, ?, ?)`,
    [courseId, classId, studentId, score])
    res.json({code:0});
})

// 17.修改积分记录
app.patch('/courses/:courseId/scores/classes/:classId/students/studentId', decodeJwt, async(req, res) => {
    const {classId, studentId} = req.params;
    const {score} = req.body;
    await db.execute(`
    UPDATE score
    SET score = ?
    WHERE student_id = ? AND class_id = ?
    `, [score, studentId, classId])
    res.json({code:0});
})

const port = 5000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});