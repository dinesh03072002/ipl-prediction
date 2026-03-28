const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PredictionAnswer = sequelize.define('PredictionAnswer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'PredictionAnswers',
  underscored: true,
  timestamps: true
});

// Define associations
PredictionAnswer.associate = function(models) {
  PredictionAnswer.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  PredictionAnswer.belongsTo(models.PredictionQuestion, {
    foreignKey: 'questionId',
    as: 'question'
  });
};

module.exports = PredictionAnswer;