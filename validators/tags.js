const Joi = require('joi');

module.exports.getTagsSchema = Joi.object({
    page: Joi.number().min(0),
    perPage: Joi.number().min(1).max(100).positive(),
});

module.exports.createTagSchema = Joi.object({
    tagId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    name: Joi.string().required(),
    type: Joi.string().valid('debit', 'credit').required(),
});

module.exports.updateTagSchema = Joi.object({
    tagId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
    fields: Joi.object({
        name: Joi.string(),
        type: Joi.string().valid('debit', 'credit'),
    }).required(),
});

module.exports.deleteTagSchema = Joi.object({
    tagId: Joi.string()
        .guid({ version: ['uuidv4'] })
        .required(),
});
