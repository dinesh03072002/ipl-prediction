const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine which database config to use
const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction) {
  // Production - Aiven MySQL
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // Development - Local MySQL
  sequelize = new Sequelize(
    process.env.DB_NAME || 'sql_prediction',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      }
    }
  );
}

module.exports = sequelize;