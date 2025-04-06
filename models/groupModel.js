import {db} from '../db/connection.js';
export const createGroup = async (name, devices, usuarioId) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Validar si ya existe un grupo con ese nombre para el usuario
      const [existingGroup] = await connection.query(
        `SELECT g.*
         FROM grupos g
         INNER JOIN dispositivos_agrupados da ON g.id = da.grupo_id
         INNER JOIN dispositivos d ON da.dispositivo_id = d.id
         WHERE g.nombre = ? AND d.usuario_id = ?
         LIMIT 1;`,
        [name, usuarioId]
      );
  
      if (existingGroup.length > 0) {
        throw new Error('Ya existe un grupo con ese nombre para este usuario');
      }
  
      // Insertar grupo en tabla 'grupos'
      const [result] = await connection.query(
        'INSERT INTO grupos (nombre) VALUES (?);',
        [name]
      );
      const groupId = result.insertId;
  
      // Insertar relación en dispositivos_agrupados y actualizar dispositivos.id_grupo
      const deviceQueries = devices.map(async (deviceId) => {
        // Insertar en tabla de relación
        await connection.query(
          'INSERT INTO dispositivos_agrupados (grupo_id, dispositivo_id) VALUES (?, ?);',
          [groupId, deviceId]
        );
  
        // Actualizar el id_grupo del dispositivo en su tabla
        await connection.query(
          'UPDATE dispositivos SET id_grupo = ? WHERE id = ?;',
          [groupId, deviceId]
        );
      });
  
      await Promise.all(deviceQueries);
  
      await connection.commit();
      return { id: groupId };
  
    } catch (error) {
      await connection.rollback();
      throw new Error('Error al crear grupo: ' + error.message);
    } finally {
      connection.release();
    }
  };
  

export const getGroups = async () => {
    const [groups] = await db.query('SELECT * FROM grupos;');

    // Obtiene los dispositivos asociados a cada grupo
    for (const group of groups) {
        const [devices] = await db.query(
            `SELECT d.id, d.nombre, d.ubicacion
             FROM dispositivos d
             JOIN dispositivos_agrupados da ON d.id = da.dispositivo_id
             WHERE da.grupo_id = ?;`,
            [group.id]
        );
        group.devices = devices;  // Agrega los dispositivos al grupo
    }

    return groups;
};