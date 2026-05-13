export default class AuthenticationError extends Error {
    constructor(message = 'Error de autenticación') {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401;
    }
}
