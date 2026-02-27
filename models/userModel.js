import bcrypt from 'bcrypt'
import { db } from '../db/connection.js';
import DBConnectionError from './modelserror/DBConnectionError.js';
import DBElementAlredyExists from './modelserror/DBElementAlredyExists.js';
import ValidationError from './modelserror/ValidationError.js';
import AuthenticationError from './modelserror/AuthenticationError.js';
import NotFoundError from './modelserror/NotFoundError.js';

export class userModel {

    static async register({ input }) {

        const {
            nombre,
            correo,
            contraseña,
            proveedor
        } = input;

        let existingUser = null;

        try {
            [existingUser] = await db.query(`SELECT correo FROM usuarios WHERE correo = ?`, [correo]);
        } catch (error) {
            throw new DBConnectionError('Ocurrio un error al obtener los datos ' + error.message);
        }

        if (existingUser.length > 0) throw new DBElementAlredyExists('El correo ya esta registrado');


        let existingSupplier = null;

        try {
            [existingSupplier] = await db.query(`SELECT * FROM proveedores WHERE id = ?`, [proveedor]);
        } catch (error) {
            throw new DBConnectionError('Ocurrio un error al obtener los datos ' + error.message);
        }

        if (!existingSupplier && existingSupplier.length == 0) throw new DBElementAlredyExists('No se encontro el proveedor');

        const sal = parseInt(process.env.SALT_ROUNDS) || 8;
        const hashedPassword = await bcrypt.hash(contraseña, sal);

        try {
            await db.query(
                `INSERT INTO usuarios (nombre, correo, contraseña, id_proveedor)
                 VALUES (?, ?, ?, ?)`,
                [nombre, correo, hashedPassword, proveedor]
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

export const getProfileByIdDB = async (userId) => {
    try {
        // Obtener información básica del usuario
        const [user] = await db.query(
            `SELECT id, nombre, correo, id_proveedor, fecha_registro
             FROM usuarios WHERE id = ?`, 
            [userId]
        );

        if (!user || user.length === 0) {
            throw new Error('No se encontró el usuario');
        }

        const userProfile = user[0];

        // Obtener dispositivos del usuario
        const [devices] = await db.query(
            `SELECT id, nombre, ubicacion 
             FROM dispositivos WHERE usuario_id = ?`,
            [userId]
        );

        // Obtener grupos del usuario
        const [groups] = await db.query(
            `SELECT id, nombre 
             FROM grupos WHERE usuario_id = ?`,
            [userId]
        );

        // Obtener proveedor actual del usuario si existe
        let currentProvider = null;
        if (userProfile.id_proveedor) {
            const [prov] = await db.query(
                `SELECT id, nombre
                 FROM proveedores WHERE id = ?`,
                [userProfile.id_proveedor]
            );
            currentProvider = prov[0];
        }

        // Obtener TODOS los proveedores disponibles
        const [allProviders] = await db.query(
            `SELECT id, nombre
             FROM proveedores`
        );

        // Construir respuesta completa
        return {
            ...userProfile,
            proveedor_actual: currentProvider,
            proveedores_disponibles: allProviders || [],
            total_dispositivos: devices.length,
            dispositivos: devices,
            total_grupos: groups.length,
            grupos: groups
        };

    } catch (error) {
        throw new DBConnectionError('Ocurrió un error al obtener el perfil del usuario: ' + error.message);
    }
};

export const updateProfileDB = async (userId, updateData) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { nombre, correo, id_proveedor } = updateData;

        // 1. Verificar que el usuario existe
        const [user] = await connection.query(
            `SELECT id FROM usuarios WHERE id = ?`, 
            [userId]
        );
        
        if (!user || user.length === 0) {
            throw new Error('Usuario no encontrado');
        }

        // 2. Verificar si el correo ya está en uso por otro usuario
        if (correo) {
            const [existing] = await connection.query(
                `SELECT id FROM usuarios WHERE correo = ? AND id != ?`,
                [correo, userId]
            );
            if (existing.length > 0) {
                throw new Error('El correo ya está en uso por otro usuario');
            }
        }

        // 3. Verificar que el proveedor existe si se proporciona
        if (id_proveedor) {
            const [provider] = await connection.query(
                `SELECT id FROM proveedores WHERE id = ?`,
                [id_proveedor]
            );
            if (!provider || provider.length === 0) {
                throw new Error('Proveedor no encontrado');
            }
        }

        // 4. Construir la consulta dinámica
        const updates = [];
        const params = [];
        
        if (nombre) {
            updates.push('nombre = ?');
            params.push(nombre);
        }
        
        if (correo) {
            updates.push('correo = ?');
            params.push(correo);
        }
        
        if (id_proveedor !== undefined) {
            updates.push('id_proveedor = ?');
            params.push(id_proveedor);
        }

        if (updates.length === 0) {
            throw new Error('No se proporcionaron datos para actualizar');
        }

        params.push(userId);

        // 5. Ejecutar la actualización
        await connection.query(
            `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // 6. Obtener el perfil actualizado
        const updatedProfile = await getProfileByIdDB(userId);

        await connection.commit();
        return updatedProfile;

    } catch (error) {
        await connection.rollback();
        throw new DBConnectionError('Error al actualizar el perfil: ' + error.message);
    } finally {
        connection.release();
    }
};

export const changePasswordDB = async (userId, currentPassword, newPassword) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Obtener el hash actual de la contraseña
        const [[user]] = await connection.query(
            `SELECT contraseña FROM usuarios WHERE id = ?`,
            [userId]
        );

        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        // 2. Verificar que la contraseña actual sea correcta
        const isMatch = await bcrypt.compare(currentPassword, user.contraseña);
        if (!isMatch) {
            throw new AuthenticationError('La contraseña actual es incorrecta');
        }

        // 3. Validar que la nueva contraseña sea diferente
        if (await bcrypt.compare(newPassword, user.contraseña)) {
            throw new ValidationError('La nueva contraseña debe ser diferente a la actual');
        }

        // 4. Hashear la nueva contraseña
        const salt = parseInt(process.env.SALT_ROUNDS) || 8;
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 5. Actualizar la contraseña
        await connection.query(
            `UPDATE usuarios SET contraseña = ? WHERE id = ?`,
            [hashedPassword, userId]
        );

        await connection.commit();
        return { success: true };

    } catch (error) {
        await connection.rollback();
        // Re-lanzar errores personalizados sin envolverlos
        if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof NotFoundError) {
            throw error;
        }
        throw new DBConnectionError('Error al cambiar la contraseña: ' + error.message);
    } finally {
        connection.release();
    }
};