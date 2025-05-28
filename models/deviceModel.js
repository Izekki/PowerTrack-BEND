
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

export const createDevice = async (nombre, ubicacion, usuario_id, id_grupo, id_sensor) => {
  const [result] = await db.query(
    `INSERT INTO dispositivos 
      (nombre, ubicacion, usuario_id, id_grupo, id_sensor, id_tipo_dispositivo) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, ubicacion, usuario_id, id_grupo, id_sensor, 0]
  );
  return result.insertId;
};

export const getConsumoLimitesPorTipoDispositivo = async (id_tipo_dispositivo) => {
  const [rows] = await db.query(
    `SELECT consumo_minimo_w, consumo_maximo_w FROM tipos_dispositivos WHERE id = ?`,
    [id_tipo_dispositivo]
  );

  if (rows.length === 0) {
    throw new Error(`Tipo de dispositivo con ID ${id_tipo_dispositivo} no encontrado`);
  }

  return rows[0]; // Devuelve { consumo_minimo_w, consumo_maximo_w }
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
    const query = `
      SELECT 
        dispositivos.id, 
        dispositivos.nombre AS dispositivo_nombre, 
        dispositivos.ubicacion, 
        dispositivos.usuario_id, 
        dispositivos.id_grupo,
        dispositivos.id_tipo_dispositivo,
        dispositivos.id_sensor,
        grupos.nombre AS grupo_nombre,
        sensores.mac_address  -- agregamos la MAC
      FROM dispositivos
      LEFT JOIN grupos ON dispositivos.id_grupo = grupos.id
      LEFT JOIN sensores ON dispositivos.id = sensores.dispositivo_id
      WHERE dispositivos.usuario_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows;
  } catch (error) {
    console.error('Error al obtener dispositivos para el usuario:', error.message);
    throw new Error('Error al obtener dispositivos para el usuario');
  }
};



export const getUnassignedDevicesFromDB = async (usuarioId) => {
  try {
    const query = `
      SELECT dispositivos.id, dispositivos.nombre, dispositivos.ubicacion
      FROM dispositivos
      WHERE dispositivos.id_grupo IS NULL AND dispositivos.usuario_id = ?
    `;
    const [rows] = await db.query(query, [usuarioId]);
    return rows;
  } catch (error) {
    console.error('Error al obtener dispositivos no asignados:', error.message);
    throw new Error('Error al obtener dispositivos no asignados');
  }
};

export const getDeviceByName = async (nombre, usuario_id) => {
  try {
      const [rows] = await db.query('SELECT * FROM dispositivos WHERE nombre = ? AND usuario_id = ?', [nombre, usuario_id]);
      return rows.length > 0 ? rows[0] : null;
  } catch (error) {
      console.error('Error al buscar el dispositivo por nombre:', error.message);
      throw new Error('Error al verificar el nombre del dispositivo');
  }
};

export const updateDeviceType = async (idDispositivo, tipoId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 0. Obtener el tipo actual del dispositivo (antes de actualizar)
    const [[dispositivoActual]] = await connection.query(
      `SELECT td.nombre AS tipo_actual_nombre, td.consumo_maximo_w AS consumo_actual_w
       FROM dispositivos d
       JOIN tipos_dispositivos td ON d.id_tipo_dispositivo = td.id
       WHERE d.id = ?`,
      [idDispositivo]
    );

    // 1. Actualizar el tipo del dispositivo
    const [updateResult] = await connection.query(
      "UPDATE dispositivos SET id_tipo_dispositivo = ? WHERE id = ?",
      [tipoId, idDispositivo]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error('No se actualizó ningún dispositivo');
    }

    // 2. Obtener el usuario del dispositivo
    const [[dispositivo]] = await connection.query(
      "SELECT usuario_id FROM dispositivos WHERE id = ?",
      [idDispositivo]
    );
    const usuarioId = dispositivo.usuario_id;

    // 3. Obtener detalles del nuevo tipo
    const [[tipoNuevo]] = await connection.query(
      "SELECT nombre, consumo_maximo_w FROM tipos_dispositivos WHERE id = ?",
      [tipoId]
    );

    // 4. Obtener el id de tipo_alerta con clave 'Sistema'
    const [[tipoAlertaSistema]] = await connection.query(
      "SELECT id FROM tipos_alerta WHERE clave = 'Sistema'"
    );

    if (!tipoAlertaSistema) {
      throw new Error('No se encontró el tipo de alerta Sistema');
    }
    const tipoAlertaId = tipoAlertaSistema.id;

    // 5. Crear mensaje adaptado
    let mensaje = '';
    if (dispositivoActual && dispositivoActual.tipo_actual_nombre) {
      mensaje = `Se ha cambiado el dispositivo de "${dispositivoActual.tipo_actual_nombre}" a "${tipoNuevo.nombre}" (consumo máximo estimado: ${tipoNuevo.consumo_maximo_w}W)`;
    } else {
      mensaje = `Se ha asignado el tipo "${tipoNuevo.nombre}" al dispositivo con consumo máximo estimado de ${tipoNuevo.consumo_maximo_w}W`;
    }

    // Nivel según consumo
    let nivel = 'Bajo';
    if (tipoNuevo.consumo_maximo_w >= 1500) {
      nivel = 'Alto';
    } else if (tipoNuevo.consumo_maximo_w >= 600) {
      nivel = 'Medio';
    }

    // 🔥 Siempre insertar una nueva alerta (sin reemplazar las anteriores)
    await connection.query(
      `INSERT INTO alertas (usuario_id, dispositivo_id, mensaje, nivel, id_tipo_dispositivo, tipo_alerta_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuarioId, idDispositivo, mensaje, nivel, tipoId, tipoAlertaId]
    );

    await connection.commit();
    return updateResult.affectedRows;
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar tipo y alerta:', error.message);
    throw new Error('Error al actualizar tipo de dispositivo y alerta');
  } finally {
    connection.release();
  }
};





export const deleteDeviceFromIdDB = async (deviceId, usuarioId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Eliminar relaciones en dispositivos_agrupados si existe
    await connection.query(
      `DELETE FROM dispositivos_agrupados WHERE dispositivo_id = ?;`,
      [deviceId]
    );

    // 2. Eliminar el dispositivo verificando que pertenezca al usuario correcto
    const result = await connection.query(
      `DELETE FROM dispositivos WHERE id = ? AND usuario_id = ?;`,
      [deviceId, usuarioId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Dispositivo no encontrado o no pertenece al usuario especificado');
    }

    await connection.commit();
    return { success: true, message: 'Dispositivo eliminado correctamente' };
  } catch (error) {
    await connection.rollback();
    throw new Error('Error al eliminar el dispositivo: ' + error.message);
  } finally {
    connection.release();
  }
};