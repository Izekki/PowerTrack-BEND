import { getDeviceByIdFromDB, updateDevice, 
  createDevice, getAllDevices,getUnassignedDevicesFromDB, 
  getAllDeviceForUserFromDB,updateDeviceType } from '../models/deviceModel.js';

export const editDevice = async (req, res) => {
  const { id } = req.params;
  const {name, ubicacion, id_grupo } = req.body;

  try {
    const device = await getDeviceByIdFromDB(id);
    if (!device) return res.status(404).json({ message: 'Dispositivo no encontrado' });

    const id_usuario = device.usuario_id;

    const updated = await updateDevice(id, name, ubicacion, id_usuario, id_grupo);
    if (updated) {
      const updateDevice = await getDeviceByIdFromDB(id);
      res.json(updateDevice);

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
  const { nombre, ubicacion, usuario_id, id_grupo, id_sensor } = req.body;  // Nuevos campos

  try {
    const newDeviceId = await createDevice(nombre, ubicacion, usuario_id, id_grupo, id_sensor);
    res.status(201).json({ 
      message: 'Dispositivo creado exitosamente', 
      id: newDeviceId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el dispositivo', error });
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
    const updated = await updateDeviceType(id, id_tipo_dispositivo);
    if (updated) {
      res.json({ message: "Ícono del dispositivo actualizado correctamente" });
    } else {
      res.status(404).json({ error: "Dispositivo no encontrado o sin cambios" });
    }
  } catch (error) {
    console.error("Error al actualizar el ícono:", error);
    res.status(500).json({ error: "Error al actualizar el ícono" });
  }
};
