import { getSensorsByUserId, findSensorById, findAssignedSensorById } from '../models/sensorModel.js';


export const getSensors = async (req,res) => {
    try {
    const sensores = await getSensorsByUserId(req.user.userId);
    return res.status(200).json(sensores);
    } catch (error) {
    console.error('Error al obtener los sensores:', error);
    return res.status(500).json({ message: 'Error interno del servidor' })
    }    
};

export const getSensorById = async (req, res) => {
    const {id} = req.params;
    try {
        const sensor = await findSensorById(id);
        if (!sensor) {
      return res.status(404).json({ message: 'Sensor no encontrado' });
        }

    if (sensor.usuario_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este sensor'
      });
    }

    return res.status(200).json(sensor);
    } catch (error) {
    console.error('Error al obtener el sensor:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const verifySensor = async (req, res) => {
    const { sensorId } = req.body;
    try {
      const sensor = await findAssignedSensorById(sensorId);
      if (!sensor) {
        return res.status(404).json({ message: 'Sensor no encontrado' });
      }
      if (!sensor.asignado) {
        return res.status(400).json({ message: 'Sensor no está asignado' });
      }

      if (sensor.usuario_id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para verificar este sensor'
        });
      }

      return res.status(200).json({ message: 'Sensor verificado' });
    } catch (err) {
      console.error('Error en verifySensor:', err);
      return res.status(500).json({ message: 'Error interno' });
    }
  };