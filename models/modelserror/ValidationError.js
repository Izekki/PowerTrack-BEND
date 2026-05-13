export default class ValidationError extends Error {
    constructor(message = 'Error de validación') {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}
