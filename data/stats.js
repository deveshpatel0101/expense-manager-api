const moment = require('moment');
const pgClient = require('../db/pg');

module.exports.getStats = async (query) => {
    if (query.type === 'month') {
        return await getStatsForMonth(query.date, query.timezone);
    } else if (query.type == 'year') {
        return await getStatsForYear(query.date, query.timezone);
    } else if (query.type == 'tag-month') {
        return await getStatsByTagsByMonth(query.date, query.timezone);
    } else if (query.type == 'tag-year') {
        return await getStatsByTagsByYear(query.date, query.timezone);
    }
};

const getStatsForMonth = async (date, timezone) => {
    const results = [{ month: date, income: '0', expense: '0' }];
    let sql = `SELECT SUM(amount) amount, SUBSTRING(DATE_TRUNC('month', transactions.date AT TIME ZONE $3)::TEXT, 0, 11) transactionDate FROM transactions NATURAL JOIN tags WHERE transactions."tagId" = tags."tagId" AND tags.type=$1 AND DATE_TRUNC('month', transactions.date AT TIME ZONE $3) = $2 GROUP BY DATE_TRUNC('month', transactions.date AT TIME ZONE $3);
    `;

    const params = ['credit', date, timezone];
    let res = await pgClient.query(sql, params);
    results[0]['income'] = res.rows.length > 0 ? res.rows[0].amount : '0';

    params[0] = 'debit';
    res = await pgClient.query(sql, params);
    results[0]['expense'] = res.rows.length > 0 ? res.rows[0].amount : '0';

    return results;
};

const getStatsForYear = async (date, timezone) => {
    const fromDate = date;
    const toDate = moment(date).add(11, 'M').format('YYYY-MM-DD');
    let sql = `SELECT SUM(amount) amount, SUBSTRING(DATE_TRUNC('month', transactions.date AT TIME ZONE $4)::TEXT, 0, 11) transactionDate FROM transactions NATURAL JOIN tags WHERE transactions."tagId" = tags."tagId" AND tags.type=$1 AND DATE_TRUNC('month', transactions.date AT TIME ZONE $4) >= $2 AND DATE_TRUNC('month', transactions.date AT TIME ZONE $4) <= $3 GROUP BY DATE_TRUNC('month', transactions.date AT TIME ZONE $4);`;
    const params = ['credit', fromDate, toDate, timezone];
    const credits = await pgClient.query(sql, params);

    params[0] = 'debit';
    const debits = await pgClient.query(sql, params);
    return reshapeResults(credits.rows, debits.rows);
};

const getStatsByTagsByMonth = async (date, timezone) => {
    const params = [date, timezone]
    const sql = `SELECT tags.name, tags.type, SUM(transactions.amount) AS amount FROM transactions JOIN tags ON tags."tagId" = transactions."tagId" WHERE DATE_TRUNC('month', transactions.date AT TIME ZONE $2) = $1 GROUP BY tags.name, tags.type;`
    const res = await pgClient.query(sql, params);
    return res.rows;
}

const getStatsByTagsByYear = async (date, timezone) => {
    const fromDate = date;
    const toDate = moment(date).add(11, 'M').format('YYYY-MM-DD');
    const params = [fromDate, toDate, timezone];
    const sql = `SELECT tags.name, tags.type, SUM(transactions.amount) AS amount FROM transactions JOIN tags ON tags."tagId" = transactions."tagId" WHERE DATE_TRUNC('month', transactions.date AT TIME ZONE $3) >= $1 AND DATE_TRUNC('month', transactions.date AT TIME ZONE $3) <= $2 GROUP BY tags.name, tags.type;`
    const res = await pgClient.query(sql, params);
    return res.rows;
}

const reshapeResults = (credits, debits) => {
    const results = {};
    for (let c of credits) {
        const date = moment(c.transactiondate).format('YYYY-MM-DD');
        const amount = c.amount;
        if (!(date in results)) {
            results[date] = { income: '0', expense: '0' };
        }
        results[date]['income'] = amount;
    }

    for (let d of debits) {
        const date = moment(d.transactiondate).format('YYYY-MM-DD');
        const amount = d.amount;
        if (!(date in results)) {
            results[date] = { income: '0', expense: '0' };
        }
        results[date]['expense'] = amount;
    }

    let resultsArray = [];
    for (let key in results) {
        resultsArray.push({
            month: key,
            income: results[key].income,
            expense: results[key].expense,
        });
    }

    return resultsArray;
};
