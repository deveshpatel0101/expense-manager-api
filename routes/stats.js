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

    formatQuery(query);

    const stats = await getStats(query);
    return res.status(200).json({ error: false, data: stats });
});

const formatQuery = (query) => {
    if (query.type === 'month' || query.type === 'tag-month') {
        query.date = moment(query.date, 'YYYY-MM').format('YYYY-MM-DD');
    } else {
        query.date = moment(query.date, 'YYYY').format('YYYY-MM-DD');
    }
    return true;
};

module.exports = router;
