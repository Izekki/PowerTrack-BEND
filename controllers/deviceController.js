/*import { getDeviceById, updateDevice } from '../models/deviceModel.js';

export const editDevice = async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  try {
    const device = await getDeviceById(id);
    if (!device) return res.status(404).json({ message: 'Dispositivo no encontrado' });

    const updated = await updateDevice(id, name, status);
    if (updated) {
      res.json({ message: 'Dispositivo actualizado correctamente' });
    } else {
      res.status(500).json({ message: 'No se pudo actualizar el dispositivo' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

export const addDevice = async (req, res) => {
  const { name, status } = req.body;

  try {
    const newDeviceId = await createDevice(name, status);
    res.status(201).json({ 
      message: 'Dispositivo creado exitosamente', 
      id: newDeviceId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el dispositivo', error });
  }
};*/

import { getDeviceById, updateDevice, createDevice } from '../models/deviceModel.js';

export const editDevice = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const device = await getDeviceById(id);
    if (!device) return res.status(404).json({ message: 'Dispositivo no encontrado' });

    const updated = await updateDevice(id, name);
    if (updated) {
      res.json({ message: 'Dispositivo actualizado correctamente' });
    } else {
      res.status(500).json({ message: 'No se pudo actualizar el dispositivo' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

export const addDevice = async (req, res) => {
  const { name } = req.body;

  try {
    const newDeviceId = await createDevice(name);
    res.status(201).json({ 
      message: 'Dispositivo creado exitosamente', 
      id: newDeviceId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el dispositivo', error });
  }
};
