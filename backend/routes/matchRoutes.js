const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, matchController.createMatch);
router.get('/', matchController.getAllMatches);
router.put('/:id/status', authMiddleware, matchController.updateMatchStatus);

module.exports = router;