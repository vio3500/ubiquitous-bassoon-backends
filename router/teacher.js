const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {});
router.post('/', (req, res) => {});
router.get('/:id', (req, res) => {
    const teacherId = req.params.id;
    res.send(teacherId);
});

module.exports = router;