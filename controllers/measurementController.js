import { findSensorByMac } from "../models/sensorModel.js";
import { saveMeasurement } from "../models/measurementModel.js";
import AlertModel from "../models/alertModel.js";

const LIMITES_MEDICION = {
  voltaje: { min: 0, max: 300 },
  corriente: { min: 0, max: 100 },
  potencia: { min: 0, max: 20000 },
  factor_potencia: { min: 0, max: 1 },
  energia: { min: 0, max: 1e9 },
  frecuencia: { min: 45, max: 65 }
};

export const createMeasurement = async (req, res) => {
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

    if (sensor.usuario_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para registrar mediciones para este sensor'
      });
    }

    for (const [campo, { min, max }] of Object.entries(LIMITES_MEDICION)) {
      const valor = Number(req.body[campo]);
      if (Number.isNaN(valor) || valor < min || valor > max) {
        return res.status(400).json({ message: `Valor fuera de rango: ${campo}` });
      }
    }

    const measurementDate = new Date(timestamp);
    if (Number.isNaN(measurementDate.getTime())) {
      return res.status(400).json({ message: 'Timestamp invalido' });
    }

    // Guardar la medición
    await saveMeasurement(
      sensor.id,
      Number(voltaje),
      Number(corriente),
      Number(potencia),
      Number(factor_potencia),
      Number(energia),
      Number(frecuencia),
      measurementDate
    );

    AlertModel.verificarAlertasPorConsumo(sensor.id, Number(potencia))
      .catch(e => console.error('Error en verificación de alertas:', e));

    res.status(201).json({ message: "Medición guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar medición:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};