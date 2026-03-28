const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/auth');

// Get all matches - PUBLIC
router.get('/', matchController.getAllMatches);

// Create match - ADMIN ONLY
router.post('/', authMiddleware, matchController.createMatch);

// Update match status - ADMIN ONLY
router.put('/:id/status', authMiddleware, matchController.updateMatchStatus);

module.exports = router;