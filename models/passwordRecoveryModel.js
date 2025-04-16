// passwordRecoveryModel.js
import {db} from '../db/connection.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import  DBConnectionError  from './modelserror/DBConnectionError.js';

// Función para generar un token de recuperación
const generateRecoveryToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Función para crear una solicitud de recuperación
export const createPasswordRecoveryRequest = async (email) => {
  try {
    // Verificar si el usuario existe
    const [user] = await db.query(
      'SELECT id, nombre, correo FROM usuarios WHERE correo = ?',
      [email]
    );

    if (!user || user.length === 0) {
      throw new Error('No existe un usuario con este correo electrónico');
    }

    const userId = user[0].id;
    const token = generateRecoveryToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token válido por 24 horas

    // Eliminar cualquier solicitud previa para este usuario
    await db.query(
      'DELETE FROM recuperacion_passwords WHERE usuario_id = ?',
      [userId]
    );

    // Crear nueva solicitud de recuperación
    await db.query(
      `INSERT INTO recuperacion_passwords 
       (usuario_id, token, fecha_expiracion) VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    );

    return {
      usuario: {
        id: userId,
        nombre: user[0].nombre,
        correo: user[0].correo
      },
      token,
      expira: expiresAt
    };
  } catch (error) {
    throw new DBConnectionError('Error al crear solicitud de recuperación: ' + error.message);
  }
};

// Función para verificar un token de recuperación
export const verifyRecoveryToken = async (token) => {
  try {
    const [result] = await db.query(
      `SELECT r.id, r.usuario_id, r.fecha_expiracion, u.nombre, u.correo
       FROM recuperacion_passwords r
       JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.token = ?`,
      [token]
    );

    if (!result || result.length === 0) {
      throw new Error('Token inválido');
    }

    const recovery = result[0];
    const now = new Date();
    const expiresAt = new Date(recovery.fecha_expiracion);

    if (now > expiresAt) {
      throw new Error('El token ha expirado');
    }

    return {
      recoveryId: recovery.id,
      usuario: {
        id: recovery.usuario_id,
        nombre: recovery.nombre,
        correo: recovery.correo
      }
    };
  } catch (error) {
    throw new DBConnectionError('Error al verificar token: ' + error.message);
  }
};

// Función para actualizar la contraseña
export const updateUserPassword = async (userId, newPassword) => {
  try {
   
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    await db.query(
      'UPDATE usuarios SET contraseña = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    // Eliminar todas las solicitudes de recuperación para este usuario
    await db.query(
      'DELETE FROM recuperacion_passwords WHERE usuario_id = ?',
      [userId]
    );

    return true;
  } catch (error) {
    throw new DBConnectionError('Error al actualizar contraseña: ' + error.message);
  }
};