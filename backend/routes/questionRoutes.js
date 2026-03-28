const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, questionController.createQuestion);
router.get('/match/:matchId', questionController.getQuestionsByMatch);

module.exports = router;