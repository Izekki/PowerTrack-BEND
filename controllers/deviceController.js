import { getDeviceByIdFromDB, updateDevice, 
  createDevice, getAllDevices,getUnassignedDevicesFromDB, 
  getAllDeviceForUserFromDB,updateDeviceType,deleteDeviceFromIdDB,getConsumoLimitesPorTipoDispositivo } from '../models/deviceModel.js';
import { findSensorByMac,createSensor,updateSensor } from '../models/sensorModel.js';
import {insertConfiguracionAhorro,updateConfiguracionAhorroMinAndMax} from '../models/savingsSettinsModel.js'
import { getSensorByDeviceId,updateSensorMac } from '../models/sensorModel.js';
import { db } from '../db/connection.js';

export const editDevice = async (req, res) => {
  const { id } = req.params;
  const { name, ubicacion, id_grupo, mac_address } = req.body;
  const authenticatedUserId = req.user.userId;

  try {
    const device = await getDeviceByIdFromDB(id);
    if (!device) return res.status(404).json({ 
      success: false,
      message: 'Dispositivo no encontrado' 
    });

    //  Validar que el dispositivo pertenece al usuario autenticado
    if (device.usuario_id !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false,
        message: 'No tienes permiso para editar este dispositivo' 
      });
    }

    const id_usuario = device.usuario_id;

    // Actualizamos datos del dispositivo
    const updatedDevice = await updateDevice(id, name, ubicacion, id_usuario, id_grupo);

    // Si se envió mac_address, actualizamos la MAC del sensor relacionado
    if (mac_address) {
      const sensor = await getSensorByDeviceId(id);
      if (sensor) {
        await updateSensorMac(sensor.id, mac_address);
      } else {
        // Si no hay sensor, opcional: crear uno o devolver error
        return res.status(404).json({ 
          success: false,
          message: 'Sensor relacionado no encontrado para este dispositivo' 
        });
      }
    }

    if (updatedDevice) {
      const updated = await getDeviceByIdFromDB(id);
      res.json({ 
        success: true,
        data: updated,
        message: 'Dispositivo actualizado correctamente' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: 'No se pudo actualizar el dispositivo' 
      });
    }

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor', 
      error 
    });
  }
};


export const getDeviceById = async (req, res) => {
  const { id } = req.params;

  try {
    const device = await getDeviceByIdFromDB(id);
    if (!device) return res.status(404).json({ message: 'Dispositivo no encontrado' });

    res.json(device);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el dispositivo', error });
  }
}

export const addDevice = async (req, res) => {
  const { nombre, ubicacion, usuario_id, id_grupo, mac } = req.body;
  const authenticatedUserId = req.user.userId;
  let connection;

  try {
    // Validar que el usuario_id en el body coincida con el del token
    if (parseInt(usuario_id) !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false,
        message: 'No tienes permiso para crear dispositivos para otros usuarios' 
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Verificar si el usuario ya tiene un sensor con esa MAC
    const existingSensor = await findSensorByMac(mac, connection);
    
    if (existingSensor) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Ya existe un sensor registrado con esta MAC.' 
      });
    }

    // Crear el sensor
    const newSensorId = await createSensor(mac, usuario_id, connection);
    if (!newSensorId) {
      throw new Error('Error al crear el sensor');
    }

    // Crear el dispositivo asociado
    const newDeviceId = await createDevice(nombre, ubicacion, usuario_id, id_grupo, newSensorId, connection);
    if (!newDeviceId) {
      throw new Error('Error al crear el dispositivo');
    }

    // Actualizar el sensor con estado de asignado y dispositivo_id
    await updateSensor(newSensorId, {
      asignado: true,
      dispositivo_id: newDeviceId
    }, connection);

    // Obtener tipo de dispositivo (siempre 0 por ahora)
    const { consumo_minimo_w, consumo_maximo_w } = await getConsumoLimitesPorTipoDispositivo(0, connection);

    const mensaje = null;
    // Crear configuración inicial en configuracion_ahorro (valores por defecto)
    await insertConfiguracionAhorro(
      usuario_id,
      newDeviceId,
      consumo_minimo_w,
      consumo_maximo_w,
      "consumo",
      mensaje,
      connection
    );

    await connection.commit();

    res.status(201).json({ 
      success: true,
      message: 'Dispositivo, sensor y configuración creados exitosamente', 
      dispositivo_id: newDeviceId,
      sensor_id: newSensorId
    });

  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al hacer rollback:', rollbackError);
      }
    }
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear el dispositivo, sensor o configuración', 
      error 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


const updateSensorAssignment = async (sensorId, isAssigned) => {
  try {
    await updateSensor(sensorId, { asignado: isAssigned });
  } catch (error) {
    console.error('Error al actualizar el sensor:', error);
  }
};



export const getDevices = async (req, res) => {
  try {
    const devices = await getAllDevices();
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los dispositivos', error });
  }
};

export const getUnassignedDevices = async (req, res) => {
  const {id} = req.params;
  try {
    const devices = await getUnassignedDevicesFromDB(id);
    res.status(200).json(devices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los dispositivos sin grupo', error });
  }
};

export const allDeviceForUser = async (req,res) => {
  const {id} = req.params;
  try {
    const devices = await getAllDeviceForUserFromDB(id);

    // Garantizamos devolver siempre un arreglo para evitar errores en el cliente
    res.json(Array.isArray(devices) ? devices : []);
  } catch (error) {
    console.error('Error al obtener dispositivos por usuario:', error);
    res.status(500).json({ message: 'Error al obtener el dispositivo', error: error.message });
  }
}

export const updateTipoDispositivo = async (req, res) => {
  const { id } = req.params;
  const { id_tipo_dispositivo } = req.body;

  try {
    // 1. Actualizar el tipo del dispositivo
    const updated = await updateDeviceType(id, id_tipo_dispositivo);
    if (!updated) {
      return res.status(404).json({ error: "Dispositivo no encontrado o sin cambios" });
    }

    // 2. Obtener nuevos límites desde tipos_dispositivos
    const { consumo_minimo_w, consumo_maximo_w } = await getConsumoLimitesPorTipoDispositivo(id_tipo_dispositivo);

    // 3. Actualizar la configuración de ahorro asociada al dispositivo
    const updatedConfig = await updateConfiguracionAhorroMinAndMax(
      id,
      consumo_minimo_w,
      consumo_maximo_w
    );

    if (!updatedConfig) {
      return res.status(500).json({ warning: "Configuración no actualizada, pero tipo sí lo fue." });
    }

    res.json({
      message: "Tipo de dispositivo y configuración de ahorro actualizados correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar el ícono:", error);
    res.status(500).json({ error: "Error al actualizar el ícono y configuración" });
  }
};

export const deleteDeviceFromId = async (req, res) => {
  const deviceId = parseInt(req.params.id);
  const authenticatedUserId = req.user.userId;

  if (isNaN(deviceId)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID de dispositivo inválido' 
    });
  }

  try {
    // Obtener el dispositivo y validar que pertenece al usuario autenticado
    const device = await getDeviceByIdFromDB(deviceId);
    if (!device) {
      return res.status(404).json({ 
        success: false,
        error: 'Dispositivo no encontrado' 
      });
    }

    // 🔒 Validar que el dispositivo pertenece al usuario autenticado
    if (device.usuario_id !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permiso para eliminar este dispositivo' 
      });
    }

    const result = await deleteDeviceFromIdDB(deviceId, authenticatedUserId);
    res.status(200).json({ 
      success: true,
      message: 'Dispositivo eliminado correctamente',
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};
