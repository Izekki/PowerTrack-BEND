import { db } from '../db/connection.js';
import DBConnectionError from './modelserror/DBConnectionError.js';
import DBElementAlredyExists from './modelserror/DBElementAlredyExists.js';

export class SupplierModel {

    static async createSupplier({ input }) {
        const { nombre, tarifas } = input;

        // Verificar si el proveedor ya existe
        let existingSupplier = null;
        let nombreLower = nombre.toLowerCase();

        try {
            [existingSupplier] = await db.query(`SELECT proveedores FROM suppliers WHERE LOWER(nombre) = ?`, [nombreLower]);
        } catch (error) {
            console.log(error.message);
            throw new DBConnectionError('Ocurrió un error al verificar si el proveedor');
        }

        if (existingSupplier.length > 0) throw new DBElementAlredyExists('El proveedor ya está registrado');

        // Insertar nuevo proveedor
        try {
            await db.query(
                `INSERT INTO proveedores (nombre, tarifas)
                 VALUES (?, ?)`,
                [nombre, tarifas]
            );
        } catch (error) {
            console.log(error.message);
            throw new DBConnectionError('Ocurrió un error al crear el proveedor');
        }

        // Obtener el proveedor recién creado
        let supplier = null;

        try {
            [supplier] = await db.query(
                `SELECT id, nombre, tarifas
                 FROM proveedores WHERE nombre = ?`,
                [nombre]
            );

            if (!supplier || supplier.length === 0) throw new DBConnectionError('Ocurrió un error al obtener el nuevo proveedor');
        } catch (error) {
            console.log(error.message);
            throw new DBConnectionError('Ocurrió un error al obtener el nuevo proveedor');
            
        }

        return supplier[0];
    }

    // Obtener todos los proveedores
    static async getSuppliers() {
        let suppliers = null;

        try {
            [suppliers] = await db.query('SELECT id, nombre, tarifas FROM proveedores');
        } catch (error) {
            console.log(error.message);
            throw new DBConnectionError('Ocurrió un error al obtener los proveedores');
        }

        return suppliers;
    }

    // Obtener un proveedor por su ID
    static async getSupplierById(id) {
        let supplier = null;

        try {
            [supplier] = await db.query('SELECT id, nombre, tarifas FROM proveedores WHERE id = ?', [id]);
        } catch (error) {
            console.log(error.message);
            throw new DBConnectionError('Ocurrió un error al obtener el proveedor');
        }

        return supplier.length > 0 ? supplier[0] : null;
    }

    // Actualizar proveedor por ID
    static async updateSupplierById(id, { nombre, tarifas }) {
        let updatedSupplier = null;

        try {
            [updatedSupplier] = await db.query(
                'UPDATE suppliers SET nombre = ?, tarifas = ? WHERE id = ?',
                [nombre, tarifas, id]
            );

            // Verificar si el proveedor fue actualizado
            if (updatedSupplier.affectedRows === 0) return null;
            
        } catch (error) {
            console.log(error.message);
            throw new DBConnectionError('Ocurrió un error al actualizar el proveedor');
        }

        return { id, nombre, tarifas };
    }

    // Eliminar proveedor por ID
    static async deleteSupplierById(id) {
        let deletedSupplier = null;

        try {
            [deletedSupplier] = await db.query('DELETE FROM proveedores WHERE id = ?', [id]);

            if (deletedSupplier.affectedRows === 0) return null;
            
        } catch (error) {
            console.log(error.message);
            throw new DBConnectionError('Ocurrió un error al eliminar el proveedor');
        }

        return { message: 'Proveedor eliminado exitosamente' };
    }
}
