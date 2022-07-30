const router = require('express').Router();
const moment = require('moment');

const auth = require('../middlewares/auth');
const { getStatsSchema } = require('../validators/stats');
const { getStats } = require('../data/stats');

router.get('/', auth, async (req, res) => {
    let query = { ...req.query };
    const validator = getStatsSchema.validate(query);
    query = { ...validator.value };

    if (validator.error) {
        return res.status(400).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    if (!isValidQuery(query)) {
        return res.status(400).json({
            error: true,
            errorType: 'date',
            errorMessage: 'Query can only be for maximum 12 months.',
        });
    }
    const stats = await getStats(query);
    return res.status(200).json(stats);
});

const isValidQuery = (query) => {
    if (query.isRange) {
        const fromDate = moment(query.fromDate, 'YYYY-MM');
        const toDate = moment(query.toDate, 'YYYY-MM');
        const months = toDate.diff(fromDate, 'months', true);
        if (Math.abs(months) + 1 > 12) {
            return false;
        }
        if (months < 0) {
            const temp = query.fromDate;
            query.fromDate = query.toDate;
            query.toDate = temp;
        }
        query.fromDate = moment(query.fromDate, 'YYYY-MM').format('YYYY-MM-DD');
        query.toDate = moment(query.toDate, 'YYYY-MM').format('YYYY-MM-DD');
    } else {
        query.date = moment(query.date, 'YYYY-MM').format('YYYY-MM-DD');
    }
    return true;
};

module.exports = router;
