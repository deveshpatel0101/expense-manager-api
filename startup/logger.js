const winston = require('winston');

require('winston-mongodb');
require('express-async-errors');

module.exports = () => {
    process.on('uncaughtException', (ex) => {
        winston.error(ex.message, ex);
    });

    process.on('unhandledRejection', (ex) => {
        throw ex;
    });

    winston.add(new winston.transports.File({ filename: 'logfile.log' }));

    winston.exceptions.handle(
        new winston.transports.File({ filename: 'uncaughtExceptions.log' })
    );
};
