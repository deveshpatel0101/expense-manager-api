const moment = require('moment');
const pgClient = require('../db/pg');

module.exports.getStats = async (query) => {
    if (query.type === 'month') {
        return await getStatsForMonth(query.date);
    } else if (query.type == 'year') {
        return await getStatsForYear(query.date);
    }
};

const getStatsForMonth = async (date) => {
    const results = {};
    let sql = `SELECT SUM(amount) amount, SUBSTRING(DATE_TRUNC('month', transactions.date)::TEXT, 0, 11) transactionDate FROM transactions NATURAL JOIN tags WHERE transactions."tagId" = tags."tagId" AND tags.type=$1 AND DATE_TRUNC('month', transactions.date) = $2 GROUP BY DATE_TRUNC('month', transactions.date)`;
    results[date] = { income: 0, expense: 0 };

    const params = ['credit', date];
    let res = await pgClient.query(sql, params);
    results[date]['income'] = res.rows.length > 0 ? res.rows[0].amount : 0;

    params[0] = 'debit';
    res = await pgClient.query(sql, params);
    results[date]['expense'] = res.rows.length > 0 ? res.rows[0].amount : 0;

    return results;
};

const getStatsForYear = async (date) => {
    const fromDate = date;
    const toDate = moment(date).add(11, 'M').format('YYYY-MM-DD');
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
