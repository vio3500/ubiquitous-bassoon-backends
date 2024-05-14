const express = require('express');
const app = express();

const router = require('./router');
router(app);

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});