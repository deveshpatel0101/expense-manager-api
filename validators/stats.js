const Joi = require('joi');
const moment = require('moment');

const dateValidation = (value, helper) => {
    if (!moment(value, 'YYYY-MM', true).isValid()) {
        return helper.message(
            'Datetime must be of format YYYY-MM'
        );
    } else {
        return value;
    }
};

module.exports.getStatsSchema = Joi.object({
    isRange: Joi.boolean().required(),
    date: Joi.when('isRange', {
        is: Joi.boolean().valid(false, 'false'),
        then: Joi.string().custom(dateValidation).required(),
        otherwise: Joi.valid(null),
    }),
    fromDate: Joi.when('isRange', {
        is: Joi.boolean().valid(true, 'true'),
        then: Joi.string().custom(dateValidation).required(),
        otherwise: Joi.valid(null),
    }),
    toDate: Joi.when('isRange', {
        is: Joi.boolean().valid(true, 'true'),
        then: Joi.string().custom(dateValidation).required(),
        otherwise: Joi.valid(null),
    }),
});
