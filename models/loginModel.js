import { db } from '../db/connection.js';
import bcrypt from 'bcrypt';

export const getUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [email]);
  return rows[0];
};

export const validatePassword = async (password, storedPassword) => {
  return await bcrypt.compare(password, storedPassword);
};
