const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TransactionsSchema = new Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        note: {
            type: String,
            required: true,
            unique: false,
        },
        tagId: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            require: true,
        },
        date: {
            type: String,
            required: true,
        },
    },
    { versionKey: false }
);

TransactionsSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Transactions', TransactionsSchema);
