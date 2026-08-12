require('dotenv').config();
const mysql = require('mysql2/promise');

// TiDB Serverless requires SSL. rejectUnauthorized: true uses the public CA
// chain your OS already trusts — no need to download TiDB's cert manually.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool;