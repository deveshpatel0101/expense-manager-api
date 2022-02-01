module.exports.reshapeTransactions = (transactions) => {
    transactions.forEach((transaction) => {
        transaction.tag = {
            tagId: transaction.tagId,
            name: transaction.name,
            type: transaction.type,
        };
        delete transaction.tagId;
        delete transaction.name;
        delete transaction.type;
    });
};
