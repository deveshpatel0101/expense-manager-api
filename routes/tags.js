const router = require('express').Router();
const uuid = require('uuid');

const auth = require('../middlewares/auth');
const Tags = require('../models/tags');
const Transactions = require('../models/transactions');
const {
    createTagSchema,
    getTagsSchema,
    updateTagSchema,
    deleteTagSchema,
} = require('../validators/tags');

// returns an array of tags, uses pagination
router.get('/', auth, async (req, res) => {
    let skip = 0;
    let limit = 10;

    const page = Number.parseInt(req.query.page);
    const perPage = Number.parseInt(req.query.perPage);
    let query = {
        page: Number.isInteger(page) ? page : 1,
        perPage: Number.isInteger(perPage) ? perPage : 10,
    };

    const validator = getTagsSchema.validate(query);
    if (validator.error) {
        return res.status(403).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    if (query.perPage) {
        limit = query.perPage;
    }
    if (query.page) {
        query.page = query.page === 0 ? query.page : query.page - 1;
        skip = limit * query.page;
    }

    const tags = await Tags.find().skip(skip).limit(limit);
    res.status(200).json({
        error: false,
        tags,
    });
});

// add a new tag
router.post('/', auth, async (req, res) => {
    const newTag = {
        ...req.body,
        tagId: uuid.v4(),
    };

    const validator = createTagSchema.validate(newTag, {
        convert: false,
    });

    if (validator.error) {
        return res.status(400).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    const tag = await Tags.findOne({
        name: newTag.name,
    });

    if (tag) {
        return res.status(409).json({
            error: true,
            errorType: 'name',
            errorMessage: 'Tag with similar name already exists.',
        });
    }

    const addedTag = await Tags.create(newTag);
    res.status(200).json({
        error: false,
        addedTag,
    });
});

// update tag
router.put('/', auth, async (req, res) => {
    const tagToUpdate = {
        ...req.body,
    };

    const validator = updateTagSchema.validate(tagToUpdate);
    if (validator.error) {
        return res.status(400).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    if (tagToUpdate.fields.name) {
        let tag = Tags.findOne({ name: tagToUpdate.fields.name });
        if (tag && tag.tagId !== tagToUpdate.tagId) {
            return res.status(409).json({
                error: true,
                errorType: 'name',
                errorMessage: 'Tag with similar name already exists.',
            });
        }
    }

    const updatedTag = await Tags.findOneAndUpdate(
        { tagId: tagToUpdate.tagId },
        tagToUpdate.fields,
        { new: true }
    );

    if (!updatedTag) {
        return res.status(404).json({
            error: true,
            errorType: 'tagId',
            errorMessage: 'Required tag not found.',
        });
    }

    return res.status(200).json({
        error: false,
        updatedTag,
    });
});

// delete a tag
router.delete('/', auth, async (req, res) => {
    const tagToDelete = req.body;

    const validator = deleteTagSchema.validate(tagToDelete);
    if (validator.error) {
        return res.status(400).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    const tag = await Tags.findOne({
        tagId: tagToDelete.tagId,
    });

    if (!tag) {
        return res.status(404).json({
            error: true,
            errorType: 'tagId',
            errorMessage: 'Required tag not found.',
        });
    }

    const transactions = await Transactions.findOne({ tag: tagToDelete.name });

    if (transactions?.length > 0) {
        return res.status(400).json({
            error: true,
            errorType: 'tag',
            errorMessage:
                'There are transactions that link to this tag. First, delete all those transactions before deleting the tag.',
        });
    }

    const deletedTag = await Tags.findOneAndDelete({
        tagId: tagToDelete.tagId,
    });

    if (!deletedTag) {
        return res.status(404).json({
            error: true,
            errorType: 'tagId',
            errorMessage: 'Required tag not found.',
        });
    }

    res.status(200).json({
        error: false,
        deletedTag,
    });
});

module.exports = router;
