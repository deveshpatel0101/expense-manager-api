require('express-async-errors');
const express = require('express');
const dotenv = require('dotenv');
const winston = require('winston');

const app = express();
const port = process.env.PORT || 5000;

dotenv.config();

require('./startup/routes')(app);
require('./startup/logger')();
require('./db/pg');

// Server
const server = app.listen(port, () => {
    winston.info(`Server started on port ${port}...`);
    console.log(`Server started on port ${port}...`);
});

module.exports = server;
