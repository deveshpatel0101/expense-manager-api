const Joi = require('joi');

module.exports.getTagsSchema = Joi.object({
    page: Joi.number().min(0),
    perPage: Joi.number().min(1).max(100).positive(),
});

module.exports.createTagSchema = Joi.object({
    tagId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    name: Joi.string().trim().lowercase().required(),
    type: Joi.string().trim().lowercase().valid('debit', 'credit').required(),
});

module.exports.updateTagSchema = Joi.object({
    tagId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    fields: Joi.object({
        name: Joi.string().trim().lowercase(),
        type: Joi.string().trim().lowercase().valid('debit', 'credit'),
    })
        .min(1)
        .required(),
});

module.exports.deleteTagSchema = Joi.object({
    tagId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
});
