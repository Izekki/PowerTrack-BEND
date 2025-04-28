// models/measurementModel.js
import { db } from '../db/connection.js';

export const saveMeasurement = async (
  sensorId,
  voltaje,
  corriente,
  potencia,
  factor_potencia,
  energia,
  frecuencia
) => {
  try {
    const fechaHora = new Date(); // Fecha actual

    const query = `
      INSERT INTO mediciones
        (sensor_id, voltaje, corriente, potencia, factor_potencia, fecha_hora, energia, frecuencia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      sensorId,
      voltaje,
      corriente,
      potencia,
      factor_potencia,
      fechaHora,
      energia,
      frecuencia
    ]);

    console.log('Medición guardada correctamente');
  } catch (error) {
    console.error('Error al guardar la medición:', error);
    throw new Error('Error al guardar la medición');
  }
};
