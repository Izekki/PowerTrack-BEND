import { getAllSensors,findSensorById, findAssignedSensorById } from '../models/sensorModel.js';


export const getSensors = async (req,res) => {
    try {
        const sensores = await getAllSensors();
        res.status(200).json(sensores);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener los sensores', error})
    }    
};

export const getSensorById = async (req, res) => {
    const {id} = req.params;
    try {
        const sensor = await findSensorById(id);
        if (!sensor) {
            res.status(404).json({ message: 'Sensor no encontrado' });
        }
        res.status(200).json(sensor);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el sensor', error });
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
      return res.status(200).json({ message: 'Sensor verificado' });
    } catch (err) {
      console.error('Error en verifySensor:', err);
      return res.status(500).json({ message: 'Error interno' });
    }
  };