const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const leadService = require('../services/leadService');
const { newsletterSchema } = require('../validation/schemas');
const { formatZodError } = require('../validation/formatError');
const { ValidationError } = require('../utils/httpError');

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
    const parsed = newsletterSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ValidationError('Please double-check the highlighted field.', formatZodError(parsed.error));
    }

    const record = leadService.createNewsletterSubscription(parsed.data);
    return res.status(201).json({
        status: 'success',
        message: 'Subscribed! Look out for our next insights report.',
        data: {
            id: record.id,
            receivedAt: record.receivedAt
        }
    });
}));

module.exports = router;
