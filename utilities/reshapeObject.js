module.exports.reshapeItem = (items) => {
    items.forEach((item) => {
        item.tag = {
            tagId: item.tagId,
            name: item.name,
            type: item.type,
        };
        delete item.tagId;
        delete item.name;
        delete item.type;
    });
};
