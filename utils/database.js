const Sequelize = require('sequelize');

const sequelize = new Sequelize('node', 'root', 'qwerty', { dialect: 'mysql', host: 'localhost' });

module.exports = sequelize;

// ********** when working with mysql directly **************
// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host:'localhost',
//     user:'root',
//     database:'node',
//     password:'qwerty'
// });

// module.exports = pool.promise();