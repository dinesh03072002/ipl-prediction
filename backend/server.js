// backend/server.js (CORS configuration part)
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

// CORS Configuration - Allow both localhost and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'https://ipl-prediction-rho.vercel.app',
  'https://ipl-prediction.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Configure CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Development mode: Allowing origin:', origin);
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Set up all models in an object
const models = {
  Admin,
  User,
  Match,
  PredictionQuestion,
  PredictionAnswer,
  MatchResult
};

// Apply associations
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString() 
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS is working!', 
    origin: req.headers.origin,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established successfully. (${process.env.NODE_ENV || 'development'} mode)`);
    
    await sequelize.sync({ alter: false });
    console.log('✅ Database synced successfully.');
    
    // Create default admin if not exists
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
      console.log(`🌐 CORS: ${process.env.NODE_ENV === 'production' ? 'Restricted' : 'Open'}`);
      console.log(`📝 Admin Login: http://localhost:${PORT}/api/admin/login`);
      console.log(`🎮 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();