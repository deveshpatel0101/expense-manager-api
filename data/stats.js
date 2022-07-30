const moment = require('moment');
const pgClient = require('../db/pg');

module.exports.getStats = async (query) => {
    if (!query.isRange) {
        return await getStatsForMonth(query.date);
    }
    return await getStatsForRange(query.fromDate, query.toDate);
};

const getStatsForMonth = async (date) => {
    const results = {};
    let sql = `SELECT SUM(amount) amount, SUBSTRING(DATE_TRUNC('month', transactions.date)::TEXT, 0, 11) transactionDate FROM transactions NATURAL JOIN tags WHERE transactions."tagId" = tags."tagId" AND tags.type=$1 AND DATE_TRUNC('month', transactions.date) = $2 GROUP BY DATE_TRUNC('month', transactions.date)`;
    results[date] = { income: 0, expense: 0 };

    const params = ['credit', date];
    let res = await pgClient.query(sql, params);
    results[date]['income'] = res.rows[0].amount;

    params[0] = 'debit';
    res = await pgClient.query(sql, params);
    results[date]['expense'] = res.rows[0].amount;

    return results;
};

const getStatsForRange = async (fromDate, toDate) => {
    let sql = `SELECT SUM(amount) amount, SUBSTRING(DATE_TRUNC('month', transactions.date)::TEXT, 0, 11) transactionDate FROM transactions NATURAL JOIN tags WHERE transactions."tagId" = tags."tagId" AND tags.type=$1 AND DATE_TRUNC('month', transactions.date) >= $2 AND DATE_TRUNC('month', transactions.date) <= $3 GROUP BY DATE_TRUNC('month', transactions.date);`;
    const params = ['credit', fromDate, toDate];
    const credits = await pgClient.query(sql, params);

    params[0] = 'debit';
    const debits = await pgClient.query(sql, params);
    return reshapeResults(credits.rows, debits.rows);
};

const reshapeResults = (credits, debits) => {
    const results = {};
    for (let c of credits) {
        const date = moment(c.transactiondate).format('YYYY-MM-DD');
        const amount = c.amount;
        if (!(date in results)) {
            results[date] = { income: 0, expense: 0 };
        }
        results[date]['income'] = amount;
    }

    for (let d of debits) {
        const date = moment(d.transactiondate).format('YYYY-MM-DD');
        const amount = d.amount;
        if (!(date in results)) {
            results[date] = { income: 0, expense: 0 };
        }
        results[date]['expense'] = amount;
    }
    return results;
};
