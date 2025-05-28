import { getDeviceByIdFromDB, updateDevice, 
  createDevice, getAllDevices,getUnassignedDevicesFromDB, 
  getAllDeviceForUserFromDB,updateDeviceType,deleteDeviceFromIdDB,getConsumoLimitesPorTipoDispositivo } from '../models/deviceModel.js';
import { findSensorByMac,createSensor,updateSensor } from '../models/sensorModel.js';
import {insertConfiguracionAhorro,updateConfiguracionAhorroMinAndMax} from '../models/savingsSettinsModel.js'
import { getSensorByDeviceId,updateSensorMac } from '../models/sensorModel.js';

export const editDevice = async (req, res) => {
  const { id } = req.params;
  const { name, ubicacion, id_grupo, mac_address } = req.body;

  try {
    const device = await getDeviceByIdFromDB(id);
    if (!device) return res.status(404).json({ message: 'Dispositivo no encontrado' });

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
        return res.status(404).json({ message: 'Sensor relacionado no encontrado para este dispositivo' });
      }
    }

    if (updatedDevice) {
      const updated = await getDeviceByIdFromDB(id);
      res.json(updated);
    } else {
      res.status(500).json({ message: 'No se pudo actualizar el dispositivo' });
    }

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error });
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

  try {
    // Verificar si el usuario ya tiene un sensor con esa MAC
    const existingSensor = await findSensorByMac(mac);
    
    if (existingSensor) {
      return res.status(400).json({ 
        message: 'Este usuario ya tiene un sensor registrado con esta MAC.' 
      });
    }

    // Crear el sensor
    const newSensorId = await createSensor(mac, usuario_id);
    if (!newSensorId) {
      return res.status(500).json({ message: 'Error al crear el sensor' });
    }

    // Crear el dispositivo asociado
    const newDeviceId = await createDevice(nombre, ubicacion, usuario_id, id_grupo, newSensorId);

    // Actualizar el sensor con estado de asignado y dispositivo_id
    await updateSensor(newSensorId, {
      asignado: true,
      dispositivo_id: newDeviceId
    });

    // Obtener tipo de dispositivo (siempre 0 por ahora)
    const { consumo_minimo_w, consumo_maximo_w } = await getConsumoLimitesPorTipoDispositivo(0);

    const mensaje = null;
    // Crear configuración inicial en configuracion_ahorro (valores por defecto)
    await insertConfiguracionAhorro(
      usuario_id,
      newDeviceId,
      consumo_minimo_w,
      consumo_maximo_w,
      "consumo",
      null // mensaje
    );

    res.status(201).json({ 
      message: 'Dispositivo, sensor y configuración creados exitosamente', 
      dispositivo_id: newDeviceId,
      sensor_id: newSensorId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el dispositivo, sensor o configuración', error });
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
    const device = await getAllDeviceForUserFromDB(id);
    if (!device) return res.status(404).json({ message: 'No se encontraron los dispositivos' });
    res.json(device);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el dispositivo', error });
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
  const usuarioId = parseInt(req.body.usuarioId);

  if (isNaN(deviceId) || isNaN(usuarioId)) {
    return res.status(400).json({ error: 'ID de dispositivo o usuario inválido' });
  }

  try {
    const result = await deleteDeviceFromIdDB(deviceId, usuarioId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
