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

const timezoneValidation = (value, helper) => {
    if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
        throw new Error('Time zones are not available in this environment');
    }

    try {
        Intl.DateTimeFormat(undefined, { timeZone: value });
        return value;
    } catch (ex) {
        return helper.message('Timezone must be of valid format');
    }
};

module.exports.getStatsSchema = Joi.object({
    type: Joi.string()
        .valid('month', 'year', 'tag-month', 'tag-year')
        .required(),
    date: Joi.when('type', {
        is: Joi.string().valid('month', 'tag-month'),
        then: Joi.string().custom(monthDateValidation).required(),
    }).when('type', {
        is: Joi.string().valid('year', 'tag-year'),
        then: Joi.string().custom(yearDateValidation).required(),
    }),
    timezone: Joi.string().custom(timezoneValidation).required(),
});
