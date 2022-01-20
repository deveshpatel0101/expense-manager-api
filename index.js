require('express-async-errors');
const express = require('express');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 5000;

dotenv.config();

require('./db/mongoose')();
require('./startup/routes')(app);
require('./startup/logger')();

// Server
const server = app.listen(port, () => {
    console.log(`Server started on port ${port}...`);
});

module.exports = server;
