// controllers/measurementController.js
import { findSensorByMac } from "../models/sensorModel.js";
import { saveMeasurement } from "../models/measurementModel.js";

export const createMeasurement = async (req, res) => {
  console.log(req.body)
  try {
    const { mac_address, voltaje, corriente, potencia, factor_potencia, energia, frecuencia } = req.body;

    if (
      !mac_address ||
      voltaje == null ||
      corriente == null ||
      potencia == null ||
      factor_potencia == null ||
      energia == null ||
      frecuencia == null
    ) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // Buscar el sensor por su mac_address
    const sensor = await findSensorByMac(mac_address);

    if (!sensor) {
      return res.status(404).json({ message: "Sensor no encontrado" });
    }

    const sensorId = sensor.id;

    // Guardar la medición con el sensorId
    await saveMeasurement(sensorId, voltaje, corriente, potencia, factor_potencia, energia, frecuencia);

    res.status(201).json({ message: "Medición guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar medición:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
