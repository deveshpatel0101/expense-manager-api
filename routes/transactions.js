const router = require('express').Router();
const uuid = require('uuid');

const pgClient = require('../db/pg');
const auth = require('../middlewares/auth');
const { processQuery } = require('../utilities/queryProcessor');

const {
    getTransactionsSchema,
    createTransactionSchema,
    updateTransactionSchema,
    deleteTransactionSchema,
} = require('../validators/transactions');

// returns an array of transactions, uses pagination
router.get('/', auth, async (req, res) => {
    let query = {
        ...req.query,
    };

    const validator = getTransactionsSchema.validate(query);
    if (validator.error) {
        return res.status(403).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    processQuery(query);

    let dbQuery = `SELECT * FROM (SELECT * FROM transactions NATURAL JOIN tags) AS t WHERE amount >= $1 AND amount <= $2`;
    let queryParams = [query.minAmount, query.maxAmount];
    let count = 3;

    if (query.tagId) {
        dbQuery += ` AND "tagId"=$${count}`;
        queryParams.push(query.tagId);
        count += 1;
    }

    if (query.fromDate) {
        dbQuery += ` AND date>=$${count}`;
        queryParams.push(query.fromDate);
        count += 1;
    }

    if (query.toDate) {
        dbQuery += ` AND date<=$${count}`;
        queryParams.push(query.toDate);
        count += 1;
    }

    dbQuery += ` ORDER BY date DESC OFFSET $${count} LIMIT $${count + 1}`;
    queryParams.push(query.skip, query.limit);

    const response = await pgClient.query(dbQuery, queryParams);

    res.status(200).json({
        error: false,
        transactions: response.rows,
    });
});

// add a new transaction
router.post('/', auth, async (req, res) => {
    const transaction = {
        ...req.body,
        transactionId: uuid.v4(),
    };

    const validator = createTransactionSchema.validate(transaction);
    if (validator.error) {
        return res.status(403).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    let response = await pgClient.query(
        'SELECT "tagId" FROM tags WHERE "tagId"=$1',
        [transaction.tagId]
    );

    if (response.rows.length === 0) {
        return res.status(404).json({
            error: true,
            errorType: 'tagId',
            errorMessage: 'Required tag does not exist.',
        });
    }

    response = await pgClient.query(
        'INSERT INTO transactions ("transactionId", "tagId", note, amount, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
            transaction.transactionId,
            transaction.tagId,
            transaction.note,
            transaction.amount,
            transaction.date,
        ]
    );

    res.status(200).json({ error: false, addedTransaction: response.rows[0] });
});

// updates an item specified by item object. id is necessary.
router.put('/', auth, async (req, res) => {
    const data = {
        ...req.body,
    };

    const validator = updateTransactionSchema.validate(data);
    if (validator.error) {
        return res.status(403).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    if (data.fields.tagId) {
        const response = await pgClient.query(
            'SELECT "tagId" FROM tags WHERE "tagId"=$1',
            [data.fields.tagId]
        );

        if (response.rows.length === 0) {
            return res.status(404).json({
                error: true,
                errorType: 'tagId',
                errorMessage: 'Required tag does not exist.',
            });
        }
    }

    let dbQuery = 'UPDATE transactions SET';
    let columnsToUpdate = [];
    let queryParams = [];
    let count = 1;
    for (let prop in data.fields) {
        columnsToUpdate.push(`"${prop}"=$${count}`);
        queryParams.push(data.fields[prop]);
        count += 1;
    }
    dbQuery +=
        columnsToUpdate.join(', ') +
        `WHERE "transactionId"=$${count} RETURNING *`;
    queryParams.push(data.transactionId);

    const response = await pgClient.query(dbQuery, queryParams);

    if (response.rows.length === 0) {
        return res.status(404).json({
            error: true,
            errorType: 'item',
            errorMessage: 'Required item not found.',
        });
    }

    res.status(200).json({
        error: false,
        updatedTransaction: response.rows[0],
    });
});

// deletes a specific item specified by itemId in request body
router.delete('/', auth, async (req, res) => {
    const transaction = req.body;

    const validator = deleteTransactionSchema.validate(transaction);
    if (validator.error) {
        return res.status(403).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    const response = await pgClient.query(
        'DELETE FROM transactions WHERE "transactionId"=$1 RETURNING *',
        [transaction.transactionId]
    );

    if (response.rows.length === 0) {
        return res.status(404).json({
            error: true,
            errorType: 'item',
            errorMessage: 'Required item not found.',
        });
    }

    res.status(200).json({
        error: false,
        deletedTransaction: response.rows[0],
    });
});

module.exports = router;
