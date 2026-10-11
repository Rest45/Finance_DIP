const { Pool } = require('pg');
require('dotenv').config();

const isCloud = !!process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: isCloud ? { rejectUnauthorized: false } : false
});

module.exports = pool;