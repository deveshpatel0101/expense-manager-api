const Joi = require('joi');

module.exports.getTransactionsSchema = Joi.object({
    page: Joi.number().min(0),
    perPage: Joi.number().min(1).max(100).positive(),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    tagId: Joi.string().guid({ version: ['uuidv4'] }),
    minAmount: Joi.number().min(0).max(Number.MAX_SAFE_INTEGER),
    maxAmount: Joi.number().min(0).max(Number.MAX_SAFE_INTEGER),
});

module.exports.createTransactionSchema = Joi.object({
    transactionId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    note: Joi.string().required(),
    tagId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    amount: Joi.number().min(0).required(),
    date: Joi.number().required(),
});

module.exports.updateTransactionSchema = Joi.object({
    transactionId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    fields: Joi.object({
        note: Joi.string(),
        tagId: Joi.string().guid({ version: ['uuidv4'] }),
        amount: Joi.number().min(0),
        date: Joi.number(),
    }).required(),
});

module.exports.deleteTransactionSchema = Joi.object({
    transactionId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
});