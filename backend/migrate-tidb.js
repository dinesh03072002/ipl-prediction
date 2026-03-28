const sequelize = require('./config/database');
const Admin = require('./models/Admin');
const User = require('./models/User');
const Match = require('./models/Match');
const PredictionQuestion = require('./models/PredictionQuestion');
const PredictionAnswer = require('./models/PredictionAnswer');
const MatchResult = require('./models/MatchResult');

async function migrate() {
  try {
    console.log('🔄 Starting TiDB migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all tables (force true for first migration)
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully');
    
    // Create default admin
    const adminExists = await Admin.findOne();
    if (!adminExists) {
      await Admin.create({
        email: process.env.ADMIN_EMAIL || 'admin@iplgame.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
      console.log('✅ Default admin created');
    }
    
    // Create sample match
    const matchCount = await Match.count();
    if (matchCount === 0) {
      const sampleMatch = await Match.create({
        team1: 'Royal Challengers Bangalore',
        team2: 'Chennai Super Kings',
        matchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'upcoming'
      });
      console.log('✅ Sample match created');
      
      // Add sample questions
      await PredictionQuestion.create({
        matchId: sampleMatch.id,
        questionText: 'Who will win the match?',
        type: 'MCQ',
        options: JSON.stringify(['Royal Challengers Bangalore', 'Chennai Super Kings']),
        points: 10
      });
      
      await PredictionQuestion.create({
        matchId: sampleMatch.id,
        questionText: 'Total sixes in the match?',
        type: 'NUMBER',
        points: 15
      });
      
      console.log('✅ Sample questions created');
    }
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();