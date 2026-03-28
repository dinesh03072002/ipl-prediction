const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PredictionQuestion = sequelize.define('PredictionQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  questionText: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('MCQ', 'NUMBER', 'RANGE', 'BOOLEAN', 'TEXT'),
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  minValue: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  maxValue: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  tableName: 'PredictionQuestions',
  underscored: true,
  timestamps: true
});

// Define associations
PredictionQuestion.associate = function(models) {
  PredictionQuestion.belongsTo(models.Match, {
    foreignKey: 'matchId',
    as: 'match'
  });
  
  PredictionQuestion.hasMany(models.PredictionAnswer, {
    foreignKey: 'questionId',
    as: 'answers'
  });
  
  PredictionQuestion.hasOne(models.MatchResult, {
    foreignKey: 'questionId',
    as: 'result'
  });
};

module.exports = PredictionQuestion;