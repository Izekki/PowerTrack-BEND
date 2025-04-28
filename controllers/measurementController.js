// controllers/measurementController.js

import { saveMeasurement } from "../models/measurementModel.js";

export const createMeasurement = async (req, res) => {
  try {
    const { sensorId, voltaje, corriente, potencia, factor_potencia, energia, frecuencia } = req.body;

    if (
      !sensorId ||
      voltaje == null ||
      corriente == null ||
      potencia == null ||
      factor_potencia == null ||
      energia == null ||
      frecuencia == null
    ) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    await saveMeasurement(sensorId, voltaje, corriente, potencia, factor_potencia, energia, frecuencia);

    res.status(201).json({ message: "Medición guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar medición:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
