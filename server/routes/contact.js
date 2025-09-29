const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { contactSchema } = require('../validation/schemas');
const { formatZodError } = require('../validation/formatError');
const { ValidationError } = require('../utils/httpError');

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ValidationError('Please correct the highlighted fields.', formatZodError(parsed.error));
    }

    const leadService = req.app.get('leadService');
    const record = await leadService.createContact(parsed.data);
    return res.status(201).json({
        status: 'success',
        message: 'Thank you! Our team will reach out within one business day.',
        data: {
            id: record.id,
            receivedAt: record.receivedAt
        }
    });
}));

module.exports = router;
