const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'Users',
  underscored: true,
  timestamps: true
});

// Define associations
User.associate = function(models) {
  User.hasMany(models.PredictionAnswer, {
    foreignKey: 'userId',
    as: 'predictions'
  });
};

module.exports = User;