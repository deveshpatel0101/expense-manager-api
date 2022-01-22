const router = require('express').Router();
const uuid = require('uuid');

const Transactions = require('../models/transactions');
const Tags = require('../models/tags');
const auth = require('../middlewares/auth');
const { processQuery } = require('../utilities/queryProcessor');

const {
    getTransactionsSchema,
    createTransactionSchema,
    updateTransactionSchema,
    deleteTransactionSchema,
} = require('../validators/transactions');
const { removeProps } = require('../utilities/processRecords');

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
    console.log(query);
    const dbQuery = {
        date: { $gte: query.fromDate, $lte: query.toDate },
        amount: { $gte: query.minAmount, $lte: query.maxAmount },
    };

    if (query.tagId) {
        dbQuery['tagId'] = query.tagId;
    }

    const transactions = await Transactions.aggregate([
        {
            $match: dbQuery,
        },
        {
            $lookup: {
                from: 'tags',
                localField: 'tagId',
                foreignField: 'tagId',
                as: 'tag',
            },
        },
        {
            $project: {
                tagId: 0,
            },
        },
    ])
    .sort({ date: -1 })
    .skip(query.skip)
    .limit(query.limit)

    removeProps(transactions, ['_id']);

    res.status(200).json({
        error: false,
        transactions,
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

    const tag = await Tags.findOne({
        tagId: transaction.tagId,
    });

    if (!tag) {
        return res.status(404).json({
            error: true,
            errorType: 'tagId',
            errorMessage: 'Required tag does not exist.',
        });
    }

    const addedTransaction = await Transactions.create(transaction);
    res.status(200).json({ error: false, addedTransaction });
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

    const updatedTransaction = await Transactions.findOneAndUpdate(
        { transactionId: data.transactionId },
        data.fields,
        { new: true }
    );

    if (!updatedTransaction) {
        return res.status(404).json({
            error: true,
            errorType: 'item',
            errorMessage: 'Required item not found.',
        });
    }

    res.status(200).json({
        error: false,
        updatedTransaction,
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

    const deletedTransaction = await Transactions.findOneAndDelete(transaction);

    if (!deletedTransaction) {
        return res.status(404).json({
            error: true,
            errorType: 'item',
            errorMessage: 'Required item not found.',
        });
    }

    res.status(200).json({
        error: false,
        deletedTransaction,
    });
});

module.exports = router;
