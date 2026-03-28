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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
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
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    
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
      console.log(`🔗 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();