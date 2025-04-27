// sockets/sensorSocket.js
import { saveMeasurement } from '../models/measurementModel.js';

export const setupSensorSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('sensor-data', async (data) => {
      const { sensorId } = data;

      // Validar que el sensor ha sido asignado previamente
      const sensor = await findSensorById(sensorId);
      if (!sensor || !sensor.asignado) {
        console.log(`Sensor ${sensorId} no asignado. No se aceptan datos.`);
        return;
      }

      const { voltaje, corriente, potencia, factor_potencia, energia, frecuencia } = data;

      // Validar los valores
      const valores = { voltaje, corriente, potencia, factor_potencia, energia, frecuencia };
      if (Object.values(valores).some(v => typeof v !== 'number' || isNaN(v))) {
        console.warn('Datos no válidos, ignorando:', data);
        return;
      }

      try {
        // Guardar los datos en la base de datos
        await saveMeasurement(sensorId, voltaje, corriente, potencia, factor_potencia, energia, frecuencia);
        socket.emit('data-saved', { success: true });
      } catch (err) {
        console.error('Error guardando medición:', err);
        socket.emit('data-saved', { success: false });
      }
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};
