module.exports = function asyncHandler(handler) {
    return function wrapAsync(req, res, next) {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};
