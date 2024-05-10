const express = require('express');
const app = express();
const userRouter = require('./router/user');

app.use('/user', userRouter);
app.use('/post', userRouter);


app.listen(5000, () => console.log('Server is running on port 5000'));