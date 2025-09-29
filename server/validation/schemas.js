const { z } = require('zod');

const nameField = z.string({ required_error: 'Full name is required.' })
    .trim()
    .min(3, 'Please share your full name (3+ characters).')
    .max(120, 'Full name must be 120 characters or fewer.');

const emailField = z.string({ required_error: 'Work email is required.' })
    .trim()
    .email('Enter a valid business email address.');

const companyField = z.string({ required_error: 'Company is required.' })
    .trim()
    .min(2, 'Company name must be at least 2 characters.')
    .max(120, 'Company name must be 120 characters or fewer.');

const messageField = z.string({ required_error: 'Share your goals for this quarter.' })
    .trim()
    .min(10, 'Tell us a bit more about your goals (10+ characters).')
    .max(1000, 'Goals must be under 1000 characters.');

const honeypotField = z.string().optional().superRefine((value, ctx) => {
    if (value && value.trim().length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Spam detected.',
            path: ['website']
        });
    }
});

const contactSchema = z.object({
    name: nameField,
    email: emailField,
    company: companyField,
    message: messageField,
    website: honeypotField
}).transform(({ website, ...rest }) => rest);

const newsletterSchema = z.object({
    email: emailField,
    website: honeypotField
}).transform(({ website, ...rest }) => rest);

module.exports = {
    contactSchema,
    newsletterSchema
};
