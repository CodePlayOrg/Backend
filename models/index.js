const Sequelize = require('sequelize');
const User = require('./user');
const Time = require('./time');
const Location = require('./location');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
User.initiate(sequelize); // ← 이 줄 추가
Time.initiate(sequelize);
Location.initiate(sequelize);

module.exports = db;