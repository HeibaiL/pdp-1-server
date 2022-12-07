class ApiError extends Error {
    constructor(message, status, errors = []) {
        super();
        this.message = message;
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError() {
        return new ApiError("Unauthorized request", 401)
    }

    static BadRequest(message, errors = []) {
        return new ApiError(message, 400, errors)
    }
}
module.exports = ApiError;