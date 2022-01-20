const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TagsSchema = new Schema(
    {
        tagId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            required: true,
        },
    },
    { versionKey: false }
);

TagsSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Tags', TagsSchema);
