const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  team1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  team2: {
    type: DataTypes.STRING,
    allowNull: false
  },
  matchDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'match_date'
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'live', 'completed'),
    defaultValue: 'upcoming'
  }
}, {
  tableName: 'matches',  // Explicitly use 'matches' (plural)
  timestamps: true,
  underscored: true,
  freezeTableName: true  // This prevents Sequelize from changing the table name
});

Match.associate = function(models) {
  Match.hasMany(models.PredictionQuestion, {
    foreignKey: 'match_id',
    as: 'questions'
  });
};

module.exports = Match;