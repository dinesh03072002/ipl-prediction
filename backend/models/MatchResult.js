// backend/models/MatchResult.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchResult = sequelize.define('MatchResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  matchId: { // Add matchId field
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Matches',
      key: 'id'
    }
  },
  correctAnswer: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'MatchResults',
  underscored: true,
  timestamps: true
});

// Define associations
MatchResult.associate = function(models) {
  MatchResult.belongsTo(models.PredictionQuestion, {
    foreignKey: 'questionId',
    as: 'question'
  });
  
  MatchResult.belongsTo(models.Match, {
    foreignKey: 'matchId',
    as: 'match'
  });
};

module.exports = MatchResult;