const { Pool } = require('pg');
const winston = require('winston');

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: process.env.PG_HOST !== 'localhost' ? true : false,
});

module.exports = pool;
