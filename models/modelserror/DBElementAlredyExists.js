export default class DBElementAlredyExists extends Error {
    constructor(message = 'El elemento que quieres insertar en la tabla ya existe') {
        super(message);

        this.name = 'DBElementAlredyExists';
        this.statusCode = 422;
    }
}