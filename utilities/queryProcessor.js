const DATE_FORMAT = 'MM-DD-YYYY';
const moment = require('moment');

module.exports.processQuery = (query) => {
    if (query.perPage) {
        query['limit'] = Number.parseInt(query.perPage);
    } else {
        query['limit'] = 10;
    }
    delete query['perPage'];

    if (query.page) {
        query.page = query.page === '0' ? '1' : query.page;
        query['skip'] = (Number.parseInt(query.page) - 1) * query.limit;
    } else {
        query['skip'] = 0;
    }
    delete query['page'];

    if (query['fromDate']) {
        query['fromDate'] = moment
            .utc(query.fromDate, DATE_FORMAT)
            .startOf('day')
            .format();
    }

    if (query['toDate']) {
        query['toDate'] = moment
            .utc(query.toDate, DATE_FORMAT)
            .endOf('day')
            .format();
    }

    if (query['minAmount']) {
        query['minAmount'] = Number.parseFloat(query['minAmount']);
    } else {
        query['minAmount'] = 0;
    }

    if (query['maxAmount']) {
        query['maxAmount'] = Number.parseFloat(query['maxAmount']);
    } else {
        query['maxAmount'] = Number.POSITIVE_INFINITY;
    }

    if (query.tagId) {
        query['tagId'] = query.tagId;
    }
};
