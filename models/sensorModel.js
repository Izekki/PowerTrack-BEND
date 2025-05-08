import {db} from '../db/connection.js';

export const getAllSensors = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM sensores')
        return rows;
    } catch (error) {
        throw new Error('Error al obtener sensores');
    }
}

export const findSensorById = async (sensorId) => {
    try {
        const [rows] = await db.query('SELECT * FROM sensores WHERE id = ?', [sensorId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw new Error('Error al obtener el sensor por ID');
    }
}

export const findAssignedSensorById = async (sensorId) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM sensores WHERE id = ? AND asignado = 1',
        [sensorId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al verificar sensor asignado:', error);
      throw new Error('Error al verificar sensor asignado');
    }
  }

  export const createSensor = async (mac, usuario_id) => {
    try {
      const tipo = `Sensor Nuevo`;
  
      const [result] = await db.query(
        'INSERT INTO sensores (mac_address, tipo, asignado, usuario_id) VALUES (?, ?, false, ?)', 
        [mac, tipo, usuario_id]
      );
  
      const sensorId = result.insertId;
      return sensorId;
    } catch (error) {
      console.error('Error al crear el sensor:', error);
      return null;
    }
  };
  
  

  export const findSensorByMac = async (mac) => {
    try {
      const [rows] = await db.query('SELECT * FROM sensores WHERE mac_address = ?', [mac]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al buscar el sensor:', error);
      return null;
    }
  };


  export const findSensorByMacAndUser = async (mac, usuario_id) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM sensores WHERE mac_address = ? AND usuario_id = ?',
        [mac, usuario_id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al buscar el sensor por MAC y usuario:', error);
      return null;
    }
  };
  
  

  export const updateSensor = async (id, fields) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
  
    if (keys.length === 0) {
      throw new Error('No hay campos para actualizar');
    }
  
    const setClause = keys.map(key => `${key} = ?`).join(', ');
  
    const query = `UPDATE sensores SET ${setClause} WHERE id = ?`;
    await db.query(query, [...values, id]);
  };
  