const Joi = require('joi');

module.exports.getTransactionsSchema = Joi.object({
    page: Joi.number().min(0),
    perPage: Joi.number().min(1).max(100).positive(),
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
        tag: Joi.string(),
        amount: Joi.number().min(0),
        type: Joi.string().valid('debit', 'credit'),
        date: Joi.number(),
    }).required(),
});

module.exports.deleteTransactionSchema = Joi.object({
    transactionId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
});
