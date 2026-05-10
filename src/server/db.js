/**
 * server/db.js
 * Centralized PostgreSQL Pool for Neon
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon's secure connections
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};