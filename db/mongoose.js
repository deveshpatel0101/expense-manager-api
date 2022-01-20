const mongoose = require('mongoose');
const winston = require('winston');

module.exports = async () => {
    let db = `${process.env.MONGODB_URI}/expense-manager?retryWrites=true&w=majority`;
    await mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('connected to db...');
    winston.info('connected to db...');
};
