// backend/server.js
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();

// Import models
const Admin = require('./models/Admin');
const User = require('./models/User');
const Match = require('./models/Match');
const PredictionQuestion = require('./models/PredictionQuestion');
const PredictionAnswer = require('./models/PredictionAnswer');
const MatchResult = require('./models/MatchResult');

// Import routes
const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const questionRoutes = require('./routes/questionRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'https://ipl-prediction-rho.vercel.app',
  'https://ipl-prediction.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Set up associations
const models = {
  Admin,
  User,
  Match,
  PredictionQuestion,
  PredictionAnswer,
  MatchResult
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Routes
app.use('/api/admin', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// ========== DEBUG ENDPOINTS ==========

// Debug: Check all data
app.get('/api/debug/all-data', async (req, res) => {
  try {
    const users = await User.findAll();
    const matches = await Match.findAll();
    const questions = await PredictionQuestion.findAll();
    const results = await MatchResult.findAll();
    const answers = await PredictionAnswer.findAll();
    
    res.json({
      users: users.map(u => ({ id: u.id, name: u.name, points: u.totalPoints })),
      matches: matches.map(m => ({ id: m.id, teams: `${m.team1} vs ${m.team2}`, status: m.status })),
      questions: questions.map(q => ({ id: q.id, matchId: q.matchId, text: q.questionText, type: q.type })),
      results: results.map(r => ({ questionId: r.questionId, matchId: r.matchId, correctAnswer: r.correctAnswer })),
      answers: answers.map(a => ({ userId: a.userId, questionId: a.questionId, answer: a.answer }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug: Calculate points for a match
app.get('/api/debug/calculate-points/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { calculatePoints } = require('./utils/pointsCalculator');
    
    const questions = await PredictionQuestion.findAll({
      where: { matchId: parseInt(matchId) }
    });
    
    const results = await MatchResult.findAll({
      where: { matchId: parseInt(matchId) }
    });
    
    const resultsMap = {};
    results.forEach(r => {
      resultsMap[r.questionId] = r.correctAnswer;
    });
    
    const users = await User.findAll();
    const answers = await PredictionAnswer.findAll({
      where: { questionId: questions.map(q => q.id) }
    });
    
    const userPoints = [];
    
    for (const user of users) {
      let totalPoints = 0;
      const userAnswers = answers.filter(a => a.userId === user.id);
      const breakdown = [];
      
      for (const answer of userAnswers) {
        const question = questions.find(q => q.id === answer.questionId);
        const correctAnswer = resultsMap[answer.questionId];
        
        if (question && correctAnswer) {
          let userAnswerParsed, correctAnswerParsed;
          try { userAnswerParsed = JSON.parse(answer.answer); } catch(e) { userAnswerParsed = answer.answer; }
          try { correctAnswerParsed = JSON.parse(correctAnswer); } catch(e) { correctAnswerParsed = correctAnswer; }
          
          const points = calculatePoints(question, userAnswerParsed, correctAnswerParsed);
          totalPoints += points;
          
          breakdown.push({
            questionText: question.questionText,
            userAnswer: userAnswerParsed,
            correctAnswer: correctAnswerParsed,
            pointsEarned: points,
            maxPoints: question.points
          });
        }
      }
      
      userPoints.push({
        userName: user.name,
        totalPoints: totalPoints,
        breakdown
      });
    }
    
    res.json({ matchId, users: userPoints });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug: Recalculate all points
app.post('/api/debug/recalculate-all-points', async (req, res) => {
  try {
    const { calculatePoints } = require('./utils/pointsCalculator');
    const users = await User.findAll();
    
    for (const user of users) {
      let totalPoints = 0;
      const answers = await PredictionAnswer.findAll({ where: { userId: user.id } });
      
      for (const answer of answers) {
        const question = await PredictionQuestion.findByPk(answer.questionId);
        const result = await MatchResult.findOne({ where: { questionId: answer.questionId } });
        
        if (result && question) {
          let userAnswerParsed, correctAnswerParsed;
          try { userAnswerParsed = JSON.parse(answer.answer); } catch(e) { userAnswerParsed = answer.answer; }
          try { correctAnswerParsed = JSON.parse(result.correctAnswer); } catch(e) { correctAnswerParsed = result.correctAnswer; }
          
          totalPoints += calculatePoints(question, userAnswerParsed, correctAnswerParsed);
        }
      }
      
      await user.update({ totalPoints });
    }
    
    const updatedUsers = await User.findAll({ order: [['totalPoints', 'DESC']] });
    res.json({ message: 'Points recalculated', users: updatedUsers });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connected. (${process.env.NODE_ENV || 'development'})`);
    
    await sequelize.sync({ alter: false });
    console.log('✅ Database synced.');
    
    const adminExists = await Admin.findOne();
    if (!adminExists) {
      await Admin.create({
        email: process.env.ADMIN_EMAIL || 'admin@iplgame.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
      console.log('✅ Default admin created');
    }
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🔧 Debug endpoints:`);
      console.log(`   GET  /api/debug/all-data`);
      console.log(`   GET  /api/debug/calculate-points/:matchId`);
      console.log(`   POST /api/debug/recalculate-all-points\n`);
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
}

startServer();