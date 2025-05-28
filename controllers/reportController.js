// controllers/reportController.js

import { getProfileByIdDB } from '../models/userModel.js';
import ElectricalAnalysisModel from "../models/ElectricalAnalysisModel.js";

const electricalAnalysisModel = new ElectricalAnalysisModel();

// Helper function for safe number formatting
function safeToFixed(value, decimals, fallback = "N/A") {
  if (typeof value !== 'number' || isNaN(value)) return fallback;
  return parseFloat(value).toFixed(decimals);
}

const generateUserReport = async (req, res) => {
  const userId = req.params.idUsuario;
  const { fechaInicio, fechaFinal } = req.body;

  if (!fechaInicio || !fechaFinal) {
    return res.status(400).json({ message: 'Las fechas de inicio y final son obligatorias.' });
  }

  try {
    const user = await getProfileByIdDB(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Get consumption data using the new function with date range
    const consumoData = await electricalAnalysisModel.getConsumoPorDispositivosYGruposPorUsuarioConRango(userId, fechaInicio, fechaFinal);

    // Formatear consumo por día
    const consumoPorDia = consumoData.consumoPorDia.map(item => ({
      fecha: item.fecha,
      consumoKWh: safeToFixed(item.consumoKWh, 4)
    }));

    // Validación si no hay datos
    if (!consumoData || !consumoData.resumenGrupos || consumoData.resumenGrupos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos de consumo para el período solicitado' });
    }

    // Cálculos generales
    const consumoTotalPeriodo = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.consumoTotalKWh, 0);
    const costoTotalPeriodo = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.costoTotalMXN, 0);
    const consumoDiarioTotal = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.consumoDiarioTotalKWh, 0);
    const costoDiarioTotal = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.costoDiarioTotalMXN, 0);
    const consumoMensualTotal = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.consumoMensualTotalKWh, 0);
    const costoMensualTotal = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.costoMensualTotalMXN, 0);

    // Calcular días entre fechas
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinalDate = new Date(fechaFinal);
    const diffTime = Math.abs(fechaFinalDate - fechaInicioDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const consumoPromedioPorDia = consumoTotalPeriodo / diffDays;

    // Formato grupos y dispositivos
    const grupos = consumoData.resumenGrupos.map(grupo => ({
      nombre: grupo.nombre,
      consumoTotalKWh: safeToFixed(grupo.consumoTotalKWh, 4),
      costoTotalMXN: safeToFixed(grupo.costoTotalMXN, 2),
      consumoDiarioTotalKWh: safeToFixed(grupo.consumoDiarioTotalKWh, 4),
      costoDiarioTotalMXN: safeToFixed(grupo.costoDiarioTotalMXN, 2),
      consumoMensualTotalKWh: safeToFixed(grupo.consumoMensualTotalKWh, 4),
      costoMensualTotalMXN: safeToFixed(grupo.costoMensualTotalMXN, 2),
      consumoPorDiaKWh: safeToFixed(grupo.consumoTotalKWh / diffDays, 4),
      dispositivos: grupo.dispositivos.map(dispositivo => ({
        nombre: dispositivo.nombre,
        dispositivo_id: dispositivo.dispositivo_id,
        fechaMedicion: new Date(dispositivo.fechaMedicion).toLocaleString(),
        potenciaW: safeToFixed(dispositivo.potenciaW, 2),
        consumoActualKWh: safeToFixed(dispositivo.consumoActualKWh, 6),
        costoPorMedicionMXN: safeToFixed(dispositivo.costoPorMedicionMXN, 2),
        consumoDiarioKWh: safeToFixed(dispositivo.consumoDiarioKWh, 4),
        costoDiarioMXN: safeToFixed(dispositivo.costoDiarioMXN, 2),
        consumoMensualKWh: safeToFixed(dispositivo.consumoMensualKWh, 4),
        costoMensualMXN: safeToFixed(dispositivo.costoMensualMXN, 2),
        consumoPorDiaKWh: safeToFixed(dispositivo.consumoActualKWh * (24 * 60) / 5 / diffDays, 4),
        detalleTarifas: {
          cargo_variable: dispositivo.detalleTarifas.cargo_variable,
          cargo_capacidad: dispositivo.detalleTarifas.cargo_capacidad,
          cargo_distribucion: dispositivo.detalleTarifas.cargo_distribucion,
          cargo_fijo: dispositivo.detalleTarifas.cargo_fijo
        }
      }))
    }));

    // Obtener hora de generación en formato "8:55:13 a.m."
    const horaGeneracion = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).toLowerCase();

    // Construir JSON del reporte
    const reporteJson = {
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        fechaInicio,
        fechaFinal,
        fechaGeneracion: horaGeneracion, // <-- Aquí está el cambio
        diasEnPeriodo: diffDays
      },
      resumenGeneral: {
        consumoTotalPeriodoKWh: safeToFixed(consumoTotalPeriodo, 4),
        costoTotalPeriodoMXN: safeToFixed(costoTotalPeriodo, 2),
        consumoDiarioTotalKWh: safeToFixed(consumoDiarioTotal, 4),
        costoDiarioTotalMXN: safeToFixed(costoDiarioTotal, 2),
        consumoMensualTotalKWh: safeToFixed(consumoMensualTotal, 4),
        costoMensualTotalMXN: safeToFixed(costoMensualTotal, 2),
        consumoPorDiaKWh: safeToFixed(consumoPromedioPorDia, 4),
        costoPorDiaMXN: safeToFixed(costoTotalPeriodo / diffDays, 2)
      },
      grupos,
      consumoPorDia
    };

    // Devolver respuesta
    return res.status(200).json(reporteJson);

  } catch (error) {
    console.error('Error generando reporte:', error);
    return res.status(500).json({
      message: 'Error generando el reporte',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
export default generateUserReport;