const Joi = require('joi');
const moment = require('moment');

const monthDateValidation = (value, helper) => {
    if (!moment(value, 'YYYY-MM', true).isValid()) {
        return helper.message('Datetime must be of format YYYY-MM');
    } else {
        return value;
    }
};

const yearDateValidation = (value, helper) => {
    if (!moment(value, 'YYYY', true).isValid()) {
        return helper.message('Datetime must be of format YYYY');
    } else {
        return value;
    }
};

module.exports.getStatsSchema = Joi.object({
    type: Joi.string().valid('month', 'year', 'tag-month', 'tag-year').required(),
    date: Joi.when('type', {
        is: Joi.string().valid('month', 'tag-month'),
        then: Joi.string().custom(monthDateValidation).required(),
    }).when('type', {
        is: Joi.string().valid('year', 'tag-year'),
        then: Joi.string().custom(yearDateValidation).required(),
    }),
});
