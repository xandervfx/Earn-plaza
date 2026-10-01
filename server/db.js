// server/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Frem5462@zod',
  database: process.env.DB_NAME || 'earn_plaza',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;