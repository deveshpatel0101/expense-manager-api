const pgClient = require('../db/pg');

module.exports.getData = async (filters, skip, limit) => {
    let [queryConditions, queryParams] = getQueryConditions(filters);
    let query = `SELECT * FROM transactions WHERE ${queryConditions}`;

    query = `SELECT * from (${query} ORDER BY date DESC OFFSET $${
        queryParams.length + 1
    } LIMIT $${
        queryParams.length + 2
    }) as txns NATURAL JOIN tags ORDER BY date DESC`;

    queryParams.push(skip, limit);
    const response = await pgClient.query(query, queryParams);
    return response.rows;
};

const getQueryConditions = (filters) => {
    let queryConditions = [];
    let queryParams = [];
    let count = 1;
    if ('fromDate' in filters) {
        queryConditions.push(`date>=$${count}`);
        queryParams.push(filters.fromDate);
        count += 1;
    }

    if ('toDate' in filters) {
        queryConditions.push(`date<=$${count}`);
        queryParams.push(filters.toDate);
        count += 1;
    }

    if ('minAmount' in filters) {
        queryConditions.push(`amount>=$${count}`);
        queryParams.push(filters.minAmount);
        count += 1;
    }

    if ('maxAmount' in filters) {
        queryConditions.push(`amount<=$${count}`);
        queryParams.push(filters.maxAmount);
        count += 1;
    }

    if ('tagId' in filters) {
        queryConditions.push(`"tagId"='$${count}'`);
        queryParams.push(filters.tagId);
        count += 1;
    }

    if ('text' in filters) {
        queryConditions.push(`UPPER(note) LIKE UPPER('%${filters.text}%')`);
    }

    return [queryConditions.join(' AND '), queryParams];
};

module.exports.getTotalTransactions = async (filters) => {
    let [queryConditions, queryParams] = getQueryConditions(filters);
    let query = `SELECT COUNT("transactionId") FROM transactions WHERE ${queryConditions}`;
    const response = await pgClient.query(query, queryParams);
    return response.rows[0].count;
};

module.exports.getTotalExpense = async (filters) => {
    let [queryConditions, queryParams] = getQueryConditions(filters);
    let query = `SELECT SUM(amount) FROM (SELECT * FROM transactions WHERE ${queryConditions}) as txns NATURAL JOIN tags WHERE tags.type='debit'`;
    const response = await pgClient.query(query, queryParams);
    return response.rows[0].sum;
};

module.exports.getTotalIncome = async (filters) => {
    let [queryConditions, queryParams] = getQueryConditions(filters);
    let query = `SELECT SUM(amount) FROM (SELECT * FROM transactions WHERE ${queryConditions}) as txns NATURAL JOIN tags WHERE tags.type='credit'`;
    const response = await pgClient.query(query, queryParams);
    return response.rows[0].sum;
};
