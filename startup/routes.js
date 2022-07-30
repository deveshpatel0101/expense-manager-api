const bodyParser = require('body-parser');

const transactions = require('../routes/transactions');
const tags = require('../routes/tags');
const stats = require('../routes/stats');
const error = require('../middlewares/error');

module.exports = (app) => {
    // CORS Handler
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, Content-Length, X-Requested-With'
        );
        res.header(
            'Access-Control-Allow-Methods',
            'GET,PUT,POST,DELETE,OPTIONS'
        );

        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use('/transactions', transactions);
    app.use('/tags', tags);
    app.use('/transactions/stats', stats);
    app.use(error);
};
