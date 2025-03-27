/*import { db } from '../db/connection.js';


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

export const createDevice = async (name, status) => {
  const [result] = await db.query(
    'INSERT INTO dispositivos (nombre, estado) VALUES (?, ?)', 
    [name, status]
  );
  return result.insertId;  // Devuelve el ID del nuevo dispositivo
};*/

import { db } from '../db/connection.js';

export const getDeviceByIdFromDB = async (id) => {
  const [rows] = await db.query('SELECT * FROM dispositivos WHERE id = ?', [id]);
  return rows[0];
};

export const updateDevice = async (id, name, ubicacion, id_usuario, id_grupo) => {
  const [result] = await db.query(
    'UPDATE dispositivos   SET nombre = ?, ubicacion = ?, usuario_id = ?, id_grupo = ? WHERE id = ?',
    [name, ubicacion, id_usuario, id_grupo, id]
  );
  return result.affectedRows;
};

export const createDevice = async (nombre, ubicacion, usuario_id, id_grupo) => {
  const [result] = await db.query(
    `INSERT INTO dispositivos (nombre, ubicacion, usuario_id, id_grupo) 
     VALUES (?, ?, ?, ?)`, 
    [nombre, ubicacion, usuario_id, id_grupo]
  );
  return result.insertId;  // Devuelve el ID del nuevo dispositivo
};

export const getAllDevices = async () => {
  try {
    const query = `
      SELECT 
        dispositivos.id, 
        dispositivos.nombre AS dispositivo_nombre, 
        dispositivos.ubicacion, 
        dispositivos.usuario_id, 
        dispositivos.id_grupo,  -- Añadido id_grupo
        grupos.nombre AS grupo_nombre
      FROM dispositivos
      LEFT JOIN grupos ON dispositivos.id_grupo = grupos.id
    `;
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener todos los dispositivos:', error.message);
    throw new Error('Error al obtener todos los dispositivos');
  }
};

export const getAllDeviceForUserFromDB = async (id) => {
  try {
    const query = `SELECT 
        dispositivos.id, 
        dispositivos.nombre AS dispositivo_nombre, 
        dispositivos.ubicacion, 
        dispositivos.usuario_id, 
        dispositivos.id_grupo,  -- Añadido id_grupo
        grupos.nombre AS grupo_nombre
      FROM dispositivos
      LEFT JOIN grupos ON dispositivos.id_grupo = grupos.id
      WHERE dispositivos.usuario_id = ?`;
      const [rows] = await db.query(query, [id]);
      return rows;
  }catch(error){
    console.error('Error al obtener dispositivos para el usuario:', error.message);
    throw new Error('Error al obtener dispositivos para el usuario');
    }
};


export const getUnassignedDevicesFromDB = async () => {
  try {
    const query = `
      SELECT dispositivos.id, dispositivos.nombre, dispositivos.ubicacion
      FROM dispositivos
      WHERE dispositivos.id_grupo IS NULL
    `;
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener dispositivos no asignados:', error.message);
    throw new Error('Error al obtener dispositivos no asignados');
  }
};
