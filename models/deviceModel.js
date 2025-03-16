import { db } from '../db/connection.js';


export const getDeviceById = async (id) => {
  const [rows] = await db.query('SELECT * FROM dispositivos WHERE id = ?', [id]);
  return rows[0];
};

export const updateDevice = async (id, name, status) => {
  const [result] = await db.query(
    'UPDATE dispositivos SET nombre = ?, estado = ? WHERE id = ?',
    [name, status, id]
  );
  return result.affectedRows;
};

