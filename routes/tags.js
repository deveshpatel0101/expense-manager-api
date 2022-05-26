const router = require('express').Router();
const uuid = require('uuid');

const auth = require('../middlewares/auth');
const pgClient = require('../db/pg');

const {
    createTagSchema,
    getTagsSchema,
    updateTagSchema,
    deleteTagSchema,
} = require('../validators/tags');

// returns an array of tags, uses pagination
router.get('/', auth, async (req, res) => {
    let skip = 0;
    let limit = 100;

    const page = Number.parseInt(req.query.page);
    const perPage = Number.parseInt(req.query.perPage);
    let query = {
        page: Number.isInteger(page) ? page : 1,
        perPage: Number.isInteger(perPage) ? perPage : 100,
    };

    const validator = getTagsSchema.validate(query);
    if (validator.error) {
        return res.status(400).json({
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

    const response = await pgClient.query(
        'SELECT * FROM tags ORDER BY name OFFSET $1 LIMIT $2',
        [skip, limit]
    );

    const count = await pgClient.query(
        `SELECT COUNT("tagId") AS count FROM tags`
    );

    res.status(200).json({
        error: false,
        tags: response.rows,
        meta: {
            totalCount: parseInt(count.rows[0].count),
        },
    });
});

// add a new tag
router.post('/', auth, async (req, res) => {
    let newTag = {
        ...req.body,
        tagId: uuid.v4(),
    };

    const validator = createTagSchema.validate(newTag);
    if (validator.error) {
        return res.status(400).json({
            error: true,
            errorType: validator.error.details[0].path[0],
            errorMessage: validator.error.details[0].message,
        });
    }

    newTag = validator.value;

    const tag = await pgClient.query(
        'SELECT name FROM tags WHERE name=$1 LIMIT 1',
        [newTag.name]
    );

    if (tag.rows.length > 0) {
        return res.status(409).json({
            error: true,
            errorType: 'name',
            errorMessage: 'Tag with similar name already exists.',
        });
    }

    const response = await pgClient.query(
        'INSERT INTO tags ("tagId", name, type) VALUES ($1, $2, $3) RETURNING *',
        [newTag.tagId, newTag.name, newTag.type]
    );

    res.status(200).json({
        error: false,
        addedTag: response.rows[0],
    });
});

// update tag
router.put('/', auth, async (req, res) => {
    let tagToUpdate = {
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

    tagToUpdate = validator.value;

    if (tagToUpdate.fields.name) {
        let response = await pgClient.query(
            'SELECT * FROM tags WHERE name=$1',
            [tagToUpdate.fields.name]
        );
        response = response.rows[0];
        if (response && response.tagId !== tagToUpdate.tagId) {
            return res.status(409).json({
                error: true,
                errorType: 'name',
                errorMessage: 'Tag with similar name already exists.',
            });
        }
    }

    let columnsToUpdate = [];
    let count = 1;
    for (let prop in tagToUpdate.fields) {
        columnsToUpdate.push(`"${prop}"=$${count}`);
        count += 1;
    }

    const response = await pgClient.query(
        `UPDATE tags SET ${columnsToUpdate.join(
            ', '
        )} WHERE "tagId"=$${count} RETURNING *`,
        [...Object.values(tagToUpdate.fields), tagToUpdate.tagId]
    );

    if (response.rows.length === 0) {
        return res.status(404).json({
            error: true,
            errorType: 'tagId',
            errorMessage: 'Required tag not found.',
        });
    }

    return res.status(200).json({
        error: false,
        updatedTag: response.rows[0],
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

    let response = await pgClient.query(
        'SELECT "transactionId" FROM transactions WHERE "tagId"=$1 LIMIT 1',
        [tagToDelete.tagId]
    );

    if (response.rowCount > 0) {
        return res.status(400).json({
            error: true,
            errorType: 'tagId',
            errorMessage:
                'There are transactions that link to this tag. First, delete all those transactions before deleting the tag.',
        });
    }

    response = await pgClient.query(
        'DELETE FROM tags WHERE "tagId"=$1 RETURNING *',
        [tagToDelete.tagId]
    );

    if (response.rows.length === 0) {
        return res.status(404).json({
            error: true,
            errorType: 'tagId',
            errorMessage: 'Required tag not found.',
        });
    }

    res.status(200).json({
        error: false,
        deletedTag: response.rows[0],
    });
});

module.exports = router;
