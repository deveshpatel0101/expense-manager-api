const moment = require('moment');

module.exports.processQuery = (query) => {
    query['limit'] = query.perPage
    delete query['perPage'];

    query['skip'] = (query.page - 1) * query.limit;
    delete query['page'];

    if (query['fromDate']) {
        query['fromDate'] = moment
            .utc(query.fromDate)
            .format();
    }

    if (query['toDate']) {
        query['toDate'] = moment
            .utc(query.toDate)
            .format();
    }
};
