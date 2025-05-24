import { findSensorByMac } from "../models/sensorModel.js";
import { saveMeasurement } from "../models/measurementModel.js";
import AlertModel from "../models/alertModel.js";

export const createMeasurement = async (req, res) => {
  console.log(req.body);
  try {
    const {
      mac_address,
      voltaje,
      corriente,
      potencia,
      factor_potencia,
      energia,
      frecuencia,
      timestamp
    } = req.body;

    if (
      !mac_address ||
      voltaje == null ||
      corriente == null ||
      potencia == null ||
      factor_potencia == null ||
      energia == null ||
      frecuencia == null ||
      !timestamp
    ) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const sensor = await findSensorByMac(mac_address);
    if (!sensor) {
      return res.status(404).json({ message: "Sensor no encontrado" });
    }

    // Guardar la medición
    await saveMeasurement(
      sensor.id,
      voltaje,
      corriente,
      potencia,
      factor_potencia,
      energia,
      frecuencia,
      new Date(timestamp)
    );

    // Calcular consumo en kWh (5 minutos por medición)
    const consumoMedicionKWh = (potencia / 1000) * (5/60);

    // Verificar alertas (no bloqueante)
    AlertModel.verificarAlertasPorConsumo(sensor.id, consumoMedicionKWh)
      .catch(e => console.error('Error en verificación de alertas:', e));

    res.status(201).json({ message: "Medición guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar medición:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};