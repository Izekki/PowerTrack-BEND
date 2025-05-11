// sockets/sensorSocket.js
import { saveMeasurement } from '../models/measurementModel.js';

export const setupSensorSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('sensor-data', async (data) => {
      const { voltaje, corriente, potencia, factor_potencia, energia, frecuencia, timestamp } = data;

      // Validación de datos (asegurarse de que sean números válidos)
      if (typeof potencia !== 'number' || isNaN(potencia)) {
        console.warn('Potencia no válida:', potencia);
        return;
      }

      // Cálculo del consumo en kWh
      // Suponiendo que la medición es cada 5 segundos, calculamos el tiempo en horas
      const segundosPorMedicion = 5; // Cada medición llega cada 5 segundos
      const horasPorMedicion = segundosPorMedicion / 3600; // 3600 segundos en una hora
      const consumoKWh = (potencia / 1000) * horasPorMedicion; // Potencia en W convertida a kW

      // Cálculo del costo estimado (suponiendo una tarifa de 6.5 MXN por kWh)
      const tarifaPorKWh = 6.5; // Tarifa en MXN
      const costoEstimadoMXN = consumoKWh * tarifaPorKWh;

      // Crear el objeto con la medición procesada
      const medicionProcesada = {
        mac_address: data.mac_address,
        potenciaW: potencia,         // Potencia en W
        consumoKWh: consumoKWh,      // Consumo en kWh
        costoEstimadoMXN: costoEstimadoMXN, // Costo estimado en MXN
        timestamp: timestamp,        // Timestamp de la medición
      };

      // Guardar los datos procesados en la base de datos
      try {
        await saveMeasurement(data.mac_address, voltaje, corriente, potencia, factor_potencia, energia, frecuencia);
        console.log('Medición guardada exitosamente:', medicionProcesada);
      } catch (err) {
        console.error('Error al guardar medición:', err);
      }

      // Emitir los resultados al cliente (si es necesario)
      socket.emit('real-time-consumo', medicionProcesada);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
};
