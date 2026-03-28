const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

router.get('/', leaderboardController.getLeaderboard);
router.get('/match/:matchId', leaderboardController.getMatchLeaderboard);
router.get('/user/:userId/match/:matchId', leaderboardController.getUserMatchPoints);

module.exports = router;