const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, resultController.updateResults);
router.get('/match/:matchId', resultController.getMatchResults);
router.get('/debug/:matchId', resultController.debugResults);

module.exports = router;