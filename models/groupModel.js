import {db} from '../db/connection.js';
export const createGroup = async (name, devices, usuarioId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Validación: Comprobar que no exista ya un grupo con el mismo nombre para el usuario.
    const [existingGroup] = await connection.query(
      `SELECT id FROM grupos 
       WHERE nombre = ? AND usuario_id = ? 
       LIMIT 1;`,
      [name, usuarioId]
    );

    if (existingGroup.length > 0) {
      throw new Error('Ya existe un grupo con ese nombre');
    }

    // 2. Insertar el nuevo grupo asociado al usuario.
    const [result] = await connection.query(
      'INSERT INTO grupos (nombre, usuario_id) VALUES (?, ?);',
      [name, usuarioId]
    );
    const groupId = result.insertId;

    // 3. Validar que los dispositivos indicados existen y pertenecen al usuario.
    const [validDevices] = await connection.query(
      `SELECT id FROM dispositivos 
       WHERE id IN (?) AND usuario_id = ?;`,
      [devices, usuarioId]
    );

    if (validDevices.length !== devices.length) {
      throw new Error('Algunos dispositivos no existen o no te pertenecen');
    }

    // 4. Insertar relaciones en la tabla de dispositivos_agrupados.
    const insertQueries = devices.map(deviceId =>
      connection.query(
        'INSERT INTO dispositivos_agrupados (grupo_id, dispositivo_id) VALUES (?, ?);',
        [groupId, deviceId]
      )
    );
    await Promise.all(insertQueries);

    // 5. Actualizar el id_grupo de la tabla dispositivos para mantener la relación correcta.
    await connection.query(
      `UPDATE dispositivos 
       SET id_grupo = ? 
       WHERE id IN (?) AND usuario_id = ?;`,
      [groupId, devices, usuarioId]
    );

    await connection.commit();
    return { 
      id: groupId,
      name: name,
      devices: devices 
    };

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

export const allGroupsForUserBD = async (usuarioId) => {
  try {
    console.log('Usuario ',usuarioId)
    // 1. Obtener grupos del usuario
    const [groups] = await db.query(
      `SELECT id, nombre FROM grupos WHERE usuario_id = ?`,
      [usuarioId]
    );

    console.log('Grupos', groups)
    
    // 2. Obtener dispositivos agrupados para esos grupos
    const [devices] = await db.query(
      `SELECT 
        da.grupo_id,
        d.id AS dispositivo_id,
        d.nombre AS dispositivo_nombre,
        d.ubicacion
      FROM dispositivos_agrupados da
      INNER JOIN dispositivos d ON da.dispositivo_id = d.id
      WHERE da.grupo_id IN (SELECT id FROM grupos WHERE usuario_id = ?)`,
      [usuarioId]
    );

    console.log('Dispositivos', devices)

    // 3. Mapear resultados
    const deviceMap = devices.reduce((acc, device) => {
      const grupoId = device.grupo_id;
      if (!acc[grupoId]) acc[grupoId] = [];
      acc[grupoId].push({
        id: device.dispositivo_id,
        nombre: device.dispositivo_nombre,
        ubicacion: device.ubicacion
      });
      return acc;
    }, {});

    // 4. Combinar grupos con dispositivos
    return groups.map(group => ({
      id: group.id,
      name: group.nombre,
      devices: deviceMap[group.id] || [] // Grupos vacíos se incluyen
    }));

  } catch (error) {
    throw new Error("Error al obtener grupos: " + error.message);
  }
};

export const editGroupBD = async (groupId, name, devices, usuarioId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Actualizar el nombre del grupo
    await connection.query(
      `UPDATE grupos SET nombre = ? WHERE id = ? AND usuario_id = ?;`,
      [name, groupId, usuarioId]
    );

    // 2. Obtener dispositivos actuales en el grupo
    const [currentDevicesResult] = await connection.query(
      `SELECT dispositivo_id FROM dispositivos_agrupados WHERE grupo_id = ?;`,
      [groupId]
    );
    const currentDeviceIds = currentDevicesResult.map(row => row.dispositivo_id);

    // 3. Calcular dispositivos a agregar y quitar
    const devicesToRemove = currentDeviceIds.filter(id => !devices.includes(id));
    const devicesToAdd = devices.filter(id => !currentDeviceIds.includes(id));

    // 4. Verificar si alguno de los dispositivos a agregar ya está en otro grupo
    let conflictingDevices = [];
    if (devicesToAdd.length > 0) {
      const [conflictResults] = await connection.query(
        `SELECT id, nombre, id_grupo FROM dispositivos 
         WHERE id IN (?) AND usuario_id = ? AND (id_grupo IS NOT NULL AND id_grupo != ?)`,
        [devicesToAdd, usuarioId, groupId]
      );

      conflictingDevices = conflictResults;
    }

    // Si hay conflicto, cancelar y regresar la lista
    if (conflictingDevices.length > 0) {
      await connection.rollback();
      return { conflict: true, conflictingDevices };
    }

    // 5. Eliminar dispositivos del grupo
    if (devicesToRemove.length > 0) {
      await connection.query(
        `DELETE FROM dispositivos_agrupados 
         WHERE grupo_id = ? AND dispositivo_id IN (?);`,
        [groupId, devicesToRemove]
      );

      await connection.query(
        `UPDATE dispositivos 
         SET id_grupo = NULL 
         WHERE id IN (?) AND usuario_id = ?;`,
        [devicesToRemove, usuarioId]
      );
    }

    // 6. Agregar nuevos dispositivos al grupo
    for (const deviceId of devicesToAdd) {
      await connection.query(
        `INSERT INTO dispositivos_agrupados (grupo_id, dispositivo_id) VALUES (?, ?);`,
        [groupId, deviceId]
      );

      await connection.query(
        `UPDATE dispositivos SET id_grupo = ? WHERE id = ? AND usuario_id = ?;`,
        [groupId, deviceId, usuarioId]
      );
    }

    await connection.commit();
    return { id: groupId, name, devices };

  } catch (error) {
    await connection.rollback();
    throw new Error('Error al editar grupo: ' + error.message);
  } finally {
    connection.release();
  }
};

export const getGroupDevicesBD = async (grupoId, usuarioId) => {
  const connection = await db.getConnection();
  try {
    // Dispositivos que están en el grupo
    const [inGroup] = await connection.query(
      `SELECT * FROM dispositivos WHERE id_grupo = ? AND usuario_id = ?`,
      [grupoId, usuarioId]
    );

    // Dispositivos que NO pertenecen a ningún grupo (libres para ser agregados)
    const [outGroup] = await connection.query(
      `SELECT * FROM dispositivos WHERE id_grupo IS NULL AND usuario_id = ?`,
      [usuarioId]
    );

    return { inGroup, outGroup };
  } finally {
    connection.release();
  }
};

export const deleteGroupFromIdDB = async (groupId, usuarioId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Eliminar relaciones en dispositivos_agrupados
    await connection.query(
      `DELETE FROM dispositivos_agrupados WHERE grupo_id = ?;`,
      [groupId]
    );

    // 2. Actualizar dispositivos para eliminar la relación con el grupo
    await connection.query(
      `UPDATE dispositivos SET id_grupo = NULL WHERE id_grupo = ? AND usuario_id = ?;`,
      [groupId, usuarioId]
    );

    // 3. Eliminar el grupo
    await connection.query(
      `DELETE FROM grupos WHERE id = ? AND usuario_id = ?;`,
      [groupId, usuarioId]
    );

    await connection.commit();
    return { success: true, message: 'Grupo eliminado correctamente' };
  } catch (error) {
    await connection.rollback();
    throw new Error('Error al eliminar el grupo: ' + error.message);
  } finally {
    connection.release();
  }
};
