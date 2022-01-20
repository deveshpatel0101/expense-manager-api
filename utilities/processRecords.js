module.exports.removeProps = (docs, props) => {
    for (let i = 0; i < docs.length; i++) {
        recursiveDelete(docs[i], props);
    }
};

const recursiveDelete = (doc, props) => {
    for (prop in doc) {
        if (props.includes(prop)) {
            delete doc[prop];
        } else if (typeof doc[prop] === 'object') {
            recursiveDelete(doc[prop], props);
        }
    }
};
