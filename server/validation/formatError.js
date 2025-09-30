function formatZodError(error) {
    const fieldErrors = error.flatten().fieldErrors;
    return Object.entries(fieldErrors).reduce((acc, [field, messages]) => {
        if (messages && messages.length > 0) {
            acc[field] = messages;
        }
        return acc;
    }, {});
}

module.exports = {
    formatZodError
};
