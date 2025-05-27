// controllers/reportController.js

import { getProfileByIdDB } from '../models/userModel.js';
import { allGroupsForUserBD } from '../models/groupModel.js';
import { getSensorByDeviceId } from '../models/sensorModel.js';
import ElectricalAnalysisModel from "../models/ElectricalAnalysisModel.js";
import { fetchConfiguracionByDevice } from '../models/savingsSettinsModel.js';

const electricalAnalysisModel = new ElectricalAnalysisModel();

import PDFDocument from 'pdfkit';
import fs from 'fs';

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
    
    // If no consumption data, handle appropriately
    if (!consumoData || !consumoData.resumenGrupos || consumoData.resumenGrupos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos de consumo para el período solicitado' });
    }

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_usuario_${userId}.pdf`);

    // Handle PDF generation errors
    doc.on('error', (err) => {
      console.error('Error escribiendo el PDF:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generando el PDF', error: err.message });
      }
    });

    doc.pipe(res);

    // Header with green stripe
    doc.rect(0, 0, doc.page.width, 60).fill('#80bd00');

    // Logo if exists
    const logoPath = '../utils/logo-pw.png';
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width - 110, 10, { fit: [80, 40] });
    }

    // Title
    doc.fillColor('#000000')
      .fontSize(18)
      .text('Reporte General del Usuario', 50, 20, { align: 'left' });

    doc.moveDown(3);
    doc.fillColor('#000000');

    // User data
    doc.fontSize(12).text(`ID Usuario: ${user.id}`);
    doc.text(`Nombre: ${user.nombre}`);
    doc.text(`Email: ${user.correo}`);
    doc.text(`Fecha de Inicio: ${fechaInicio}`);
    doc.text(`Fecha Final: ${fechaFinal}`);
    doc.text(`Fecha de Generación: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Calculate summary - using the correct data structure
    const consumoTotalPeriodo = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.consumoTotalKWh, 0);
    const costoTotalPeriodo = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.costoTotalMXN, 0);
    const consumoDiarioTotal = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.consumoDiarioTotalKWh, 0);
    const costoDiarioTotal = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.costoDiarioTotalMXN, 0);
    const consumoMensualTotal = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.consumoMensualTotalKWh, 0);
    const costoMensualTotal = consumoData.resumenGrupos.reduce((sum, grupo) => sum + grupo.costoMensualTotalMXN, 0);

    // General summary
    doc.fontSize(14).text('Resumen General', { underline: true });
    doc.fontSize(12).text(`Consumo Total (Período): ${safeToFixed(consumoTotalPeriodo, 4)} kWh`);
    doc.text(`Costo Total (Período): $${safeToFixed(costoTotalPeriodo, 2)} MXN`);
    doc.text(`Consumo Diario Estimado: ${safeToFixed(consumoDiarioTotal, 4)} kWh`);
    doc.text(`Costo Diario Estimado: $${safeToFixed(costoDiarioTotal, 2)} MXN`);
    doc.text(`Consumo Mensual Estimado: ${safeToFixed(consumoMensualTotal, 4)} kWh`);
    doc.text(`Costo Mensual Estimado: $${safeToFixed(costoMensualTotal, 2)} MXN`);
    doc.moveDown();

    // Groups and devices
    consumoData.resumenGrupos.forEach(grupo => {
      doc.fontSize(13).text(`Grupo: ${grupo.nombre}`, { underline: true });
      doc.text(`Consumo Total (Período): ${safeToFixed(grupo.consumoTotalKWh, 4)} kWh`);
      doc.text(`Costo Total (Período): $${safeToFixed(grupo.costoTotalMXN, 2)} MXN`);
      doc.text(`Consumo Diario: ${safeToFixed(grupo.consumoDiarioTotalKWh, 4)} kWh`);
      doc.text(`Costo Diario: $${safeToFixed(grupo.costoDiarioTotalMXN, 2)} MXN`);
      doc.text(`Consumo Mensual: ${safeToFixed(grupo.consumoMensualTotalKWh, 4)} kWh`);
      doc.text(`Costo Mensual: $${safeToFixed(grupo.costoMensualTotalMXN, 2)} MXN`);
      doc.moveDown();

      // Device details
      grupo.dispositivos.forEach(dispositivo => {
        doc.fontSize(12).text(`  Dispositivo: ${dispositivo.nombre} (ID: ${dispositivo.dispositivo_id})`);
        doc.text(`    Última medición: ${new Date(dispositivo.fechaMedicion).toLocaleString()}`);
        doc.text(`    Potencia: ${safeToFixed(dispositivo.potenciaW, 2)} W`);
        doc.text(`    Consumo (Período): ${safeToFixed(dispositivo.consumoActualKWh, 6)} kWh`);
        doc.text(`    Costo (Período): $${safeToFixed(dispositivo.costoPorMedicionMXN, 2)} MXN`);
        doc.text(`    Consumo Diario: ${safeToFixed(dispositivo.consumoDiarioKWh, 4)} kWh`);
        doc.text(`    Costo Diario: $${safeToFixed(dispositivo.costoDiarioMXN, 2)} MXN`);
        doc.text(`    Consumo Mensual: ${safeToFixed(dispositivo.consumoMensualKWh, 4)} kWh`);
        doc.text(`    Costo Mensual: $${safeToFixed(dispositivo.costoMensualMXN, 2)} MXN`);
        
        // Tariff details
        doc.text(`    Tarifas:`);
        doc.text(`      Variable: $${dispositivo.detalleTarifas.cargo_variable} por kWh`);
        doc.text(`      Capacidad: $${dispositivo.detalleTarifas.cargo_capacidad} por kW`);
        doc.text(`      Distribución: $${dispositivo.detalleTarifas.cargo_distribucion} por kW`);
        doc.text(`      Fijo: $${dispositivo.detalleTarifas.cargo_fijo} mensual`);
        doc.moveDown();
      });
    });

    doc.end();

  } catch (error) {
    console.error('Error generando PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Error generando el PDF',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

// Helper function for safe number formatting
function safeToFixed(value, decimals, fallback = "N/A") {
  if (typeof value !== 'number' || isNaN(value)) return fallback;
  return parseFloat(value).toFixed(decimals);
}
export default generateUserReport;
