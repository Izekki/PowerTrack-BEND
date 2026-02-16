// controllers/reportController.js

import { getProfileByIdDB } from '../models/userModel.js';
import ElectricalAnalysisModel from "../models/ElectricalAnalysisModel.js";

const electricalAnalysisModel = new ElectricalAnalysisModel();

// Helper function for safe number formatting
function safeToFixed(value, decimals, fallback = "N/A") {
  if (typeof value !== 'number' || isNaN(value)) return fallback;
  return parseFloat(value).toFixed(decimals);
}

function normalizeIsoToMysqlUtc(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

const generateUserReport = async (req, res) => {
  const userId = req.params.idUsuario;
  const { fechaInicio, fechaFinal } = req.body;

  if (!fechaInicio || !fechaFinal) {
    return res.status(400).json({ message: 'Las fechas de inicio y final son obligatorias.' });
  }

  const fechaInicioSql = normalizeIsoToMysqlUtc(fechaInicio);
  const fechaFinalSql = normalizeIsoToMysqlUtc(fechaFinal);

  if (!fechaInicioSql || !fechaFinalSql) {
    return res.status(400).json({ message: 'Formato de fecha invalido. Usa ISO 8601 con Z.' });
  }

  try {
    const user = await getProfileByIdDB(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Get consumption data using the real-consumption function with date range
    const consumoData = await electricalAnalysisModel.getConsumoPorDispositivosYGruposPorUsuarioReal(userId, fechaInicioSql, fechaFinalSql);

    // Formatear consumo por día
    const consumoPorDia = consumoData.consumoPorDia.map(item => ({
      fecha: item.fecha,
      consumoKWh: safeToFixed(item.consumoKWh, 4)
    }));

    // Validación si no hay datos
    if (!consumoData || !consumoData.resumenGrupos || consumoData.resumenGrupos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos de consumo para el período solicitado' });
    }

    // Cálculos generales (usar resumenGeneral si existe, si no calcular desde grupos)
    const resumenGeneral = consumoData.resumenGeneral || {};
    const consumoTotalPeriodo = resumenGeneral.consumoRealKWh ?? consumoData.resumenGrupos.reduce((sum, grupo) => sum + (grupo.consumoRealKWh ?? grupo.consumoTotalKWh ?? 0), 0);
    const costoTotalPeriodo = resumenGeneral.costoRealMXN ?? consumoData.resumenGrupos.reduce((sum, grupo) => sum + (grupo.costoRealMXN ?? grupo.costoTotalMXN ?? 0), 0);
    const consumoDiarioTotal = resumenGeneral.consumoDiarioProyectadoKWh ?? consumoData.resumenGrupos.reduce((sum, grupo) => sum + (grupo.consumoDiarioProyectadoKWh ?? grupo.consumoDiarioTotalKWh ?? 0), 0);
    const costoDiarioTotal = resumenGeneral.costoDiarioProyectadoMXN ?? consumoData.resumenGrupos.reduce((sum, grupo) => sum + (grupo.costoDiarioProyectadoMXN ?? grupo.costoDiarioTotalMXN ?? 0), 0);
    const consumoMensualTotal = resumenGeneral.consumoMensualProyectadoKWh ?? consumoData.resumenGrupos.reduce((sum, grupo) => sum + (grupo.consumoMensualProyectadoKWh ?? grupo.consumoMensualTotalKWh ?? 0), 0);
    const costoMensualTotal = resumenGeneral.costoMensualProyectadoMXN ?? consumoData.resumenGrupos.reduce((sum, grupo) => sum + (grupo.costoMensualProyectadoMXN ?? grupo.costoMensualTotalMXN ?? 0), 0);

    // Calcular días entre fechas
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinalDate = new Date(consumoData.fechaFinReal || fechaFinal);
    const diffTime = Math.abs(fechaFinalDate - fechaInicioDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const consumoPromedioPorDia = consumoTotalPeriodo / diffDays;

    // Formato grupos y dispositivos
    const grupos = consumoData.resumenGrupos.map(grupo => ({
      nombre: grupo.nombre,
      consumoTotalKWh: safeToFixed(grupo.consumoRealKWh ?? grupo.consumoTotalKWh, 4),
      costoTotalMXN: safeToFixed(grupo.costoRealMXN ?? grupo.costoTotalMXN, 2),
      consumoDiarioTotalKWh: safeToFixed(grupo.consumoDiarioProyectadoKWh ?? grupo.consumoDiarioTotalKWh, 4),
      costoDiarioTotalMXN: safeToFixed(grupo.costoDiarioProyectadoMXN ?? grupo.costoDiarioTotalMXN, 2),
      consumoMensualTotalKWh: safeToFixed(grupo.consumoMensualProyectadoKWh ?? grupo.consumoMensualTotalKWh, 4),
      costoMensualTotalMXN: safeToFixed(grupo.costoMensualProyectadoMXN ?? grupo.costoMensualTotalMXN, 2),
      consumoPorDiaKWh: safeToFixed((grupo.consumoRealKWh ?? grupo.consumoTotalKWh ?? 0) / diffDays, 4),
      dispositivos: grupo.dispositivos.map(dispositivo => ({
        nombre: dispositivo.nombre,
        dispositivo_id: dispositivo.dispositivo_id,
        fechaMedicion: dispositivo.fechaMedicion,
        potenciaW: safeToFixed(dispositivo.potenciaPromedioActivaW ?? dispositivo.potenciaPromedioW ?? dispositivo.potenciaW, 2),
        consumoActualKWh: safeToFixed(dispositivo.consumoRealKWh ?? dispositivo.consumoActualKWh, 6),
        costoPorMedicionMXN: safeToFixed(dispositivo.costoRealMXN ?? dispositivo.costoPorMedicionMXN, 2),
        consumoDiarioKWh: safeToFixed(dispositivo.consumoDiarioProyectadoKWh ?? dispositivo.consumoDiarioKWh, 4),
        costoDiarioMXN: safeToFixed(dispositivo.costoDiarioProyectadoMXN ?? dispositivo.costoDiarioMXN, 2),
        consumoMensualKWh: safeToFixed(dispositivo.consumoMensualProyectadoKWh ?? dispositivo.consumoMensualKWh, 4),
        costoMensualMXN: safeToFixed(dispositivo.costoMensualProyectadoMXN ?? dispositivo.costoMensualMXN, 2),
        consumoPorDiaKWh: safeToFixed((dispositivo.consumoRealKWh ?? 0) / diffDays, 4),
        factorUtilizacion: safeToFixed(dispositivo.factorUtilizacion, 4),
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