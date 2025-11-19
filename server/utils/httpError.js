class HttpError extends Error {
    constructor(status, message, details = undefined) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.details = details;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

class ValidationError extends HttpError {
    constructor(message, errors) {
        super(422, message, errors);
    }
}

module.exports = {
    HttpError,
    ValidationError
};
