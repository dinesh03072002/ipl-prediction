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

// IMPORTANT: Routes must be registered BEFORE the catch-all
app.use('/api/admin', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check (no /api prefix for easier testing)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    routes: ['/api/matches', '/api/admin/login', '/api/leaderboard']
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /api/test',
      'GET /api/matches',
      'POST /api/matches',
      'PUT /api/matches/:id/status',
      'GET /api/questions/match/:matchId',
      'POST /api/questions',
      'POST /api/predictions',
      'GET /api/predictions/user/:userId',
      'POST /api/results',
      'GET /api/results/match/:matchId',
      'GET /api/leaderboard',
      'GET /api/leaderboard/match/:matchId',
      'POST /api/admin/login'
    ]
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established. (${process.env.NODE_ENV || 'development'})`);
    
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
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📝 Test API: http://localhost:${PORT}/api/test`);
      console.log(`🏏 Matches API: http://localhost:${PORT}/api/matches`);
      console.log(`🔐 Admin Login: http://localhost:${PORT}/api/admin/login\n`);
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
}

startServer();