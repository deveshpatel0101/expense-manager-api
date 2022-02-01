const Joi = require('joi');
const moment = require('moment');

const dateValidation = (value, helper) => {
    if (!moment(value, 'YYYY-MM-DDTHH:mm:ssZ').isValid()) {
        return helper.message(
            'Datetime must be of format YYYY-MM-DD HH:mm:ssZ'
        );
    } else {
        return value;
    }
};

module.exports.getTransactionsSchema = Joi.object({
    page: Joi.number().min(0),
    perPage: Joi.number().min(1).max(100).positive(),
    fromDate: Joi.string().custom(dateValidation),
    toDate: Joi.string().custom(dateValidation),
    tagId: Joi.string().guid({ version: ['uuidv4'] }),
    minAmount: Joi.number().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
    maxAmount: Joi.number()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .default(Number.MAX_SAFE_INTEGER),
});

module.exports.createTransactionSchema = Joi.object({
    transactionId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    note: Joi.string().trim().required(),
    tagId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    amount: Joi.number().min(0).required(),
    date: Joi.string().trim().custom(dateValidation).required(),
});

module.exports.updateTransactionSchema = Joi.object({
    transactionId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    fields: Joi.object({
        note: Joi.string().trim(),
        tagId: Joi.string().guid({ version: ['uuidv4'] }),
        amount: Joi.number().min(0),
        date: Joi.string().trim().custom(dateValidation),
    })
        .min(1)
        .required(),
});

module.exports.deleteTransactionSchema = Joi.object({
    transactionId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
});
