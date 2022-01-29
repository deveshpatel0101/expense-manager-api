const { Client } = require('pg');
const winston = require('winston');

const client = new Client({
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: process.env.PG_HOST !== 'localhost' ? { rejectUnauthorized: false } : false,
});

client.connect().then(() => {
    winston.info('Connected to PostgreSQL...');
    console.log('Connected to PostgreSQL...');
});

module.exports = client;
