import bcrypt from 'bcrypt'
import { db } from '../db/connection.js';
import DBConnectionError from './modelserror/DBConnectionError.js';
import DBElementAlredyExists from './modelserror/DBElementAlredyExists.js';

export class userModel {

    static async register({ input }) {

        const {
            nombre,
            correo,
            contraseña
        } = input;

        let existingUser = null;

        try {
            [existingUser] = await db.query(`SELECT correo FROM usuarios WHERE correo = ?`, [correo]);
        } catch (error) {
            throw new DBConnectionError('Ocurrio un error al obtener los datos ' + error.message);
        }

        if (existingUser.length > 0) throw new DBElementAlredyExists('El correo ya esta registrado');

        const sal = parseInt(process.env.SALT_ROUNDS) || 8;
        const hashedPassword = await bcrypt.hash(contraseña, sal);

        try {
            await db.query(
                `INSERT INTO usuarios (nombre, correo, contraseña)
                 VALUES (?, ?, ?)`,
                [nombre, correo, hashedPassword]
            );
        } catch (error) {
            throw new DBConnectionError('Ocurrio un error al crear el usuario ' + error.message);
        }

        let usuario = null;

        try {
                [usuario] = await db.query(
                `SELECT correo, nombre
                 FROM usuarios WHERE correo = ?`,
                [correo]
            );

            if (!usuario || usuario.length === 0) throw new DBConnectionError('Ocurrio un error al obtener el nuevo usuario');
            
        } catch {
            throw new DBConnectionError('Ocurrio un error al obtener el nuevo usuario');
        }

        return usuario[0];
    }



}