import express from 'express';
import ElectricalAnalysisController from '../controllers/ElectricalAnalysisController.js';
import { createMeasurement } from '../controllers/measurementController.js';
import { authenticate, authorizeByUserId } from '../middlewares/authMiddleware.js';

const router = express.Router();
const eac = new ElectricalAnalysisController(); 

// GET /electrical_analysis/ - API info
router.get('/', eac.getInfoApi);

// GET /electrical_analysis/voltaje_d/:id - Obtener voltaje de dispositivo (requiere autenticación)
router.get('/voltaje_d/:id', authenticate, eac.getVoltaje);

// GET /electrical_analysis/corriente_d/:id - Obtener corriente (requiere autenticación)
router.get('/corriente_d/:id', authenticate, eac.getCorriente);

// GET /electrical_analysis/potencia_activa_d/:id - Obtener potencia activa (requiere autenticación)
router.get('/potencia_activa_d/:id', authenticate, eac.getPotenciaActiva);

// GET /electrical_analysis/frecuencia_d/:id - Obtener frecuencia (requiere autenticación)
router.get('/frecuencia_d/:id', authenticate, eac.getFrecuencia);

// GET /electrical_analysis/factor_potencia_d/:id - Obtener factor de potencia (requiere autenticación)
router.get('/factor_potencia_d/:id', authenticate, eac.getFactorPotencia);

// GET /electrical_analysis/consumo_d/:id - Obtener consumo (requiere autenticación)
router.get('/consumo_d/:id', authenticate, eac.getConsumo);

// GET /electrical_analysis/dispositivo/:id/consumo-actual - Obtener consumo actual de dispositivo (requiere autenticación)
router.get('/dispositivo/:id/consumo-actual', authenticate, eac.getConsumoActual);

// GET /electrical_analysis/dispositivosPorUsuarios/:idUsuario/consumo-actual - CRÍTICO (requiere autenticación y validación)
router.get('/dispositivosPorUsuarios/:idUsuario/consumo-actual', authenticate, authorizeByUserId('idUsuario'), eac.getDispositivosPorUsuarioConsumo);

// GET /electrical_analysis/dispositivo/:id/consumo-detallado - CRÍTICO: Obtener consumo detallado (requiere autenticación)
router.get('/dispositivo/:id/consumo-detallado', authenticate, eac.getConsumoDetalladoPorDispositivo);

// GET /electrical_analysis/consumoPorDispositivosGrupos/:id - CRÍTICO (requiere autenticación y validación)
router.get('/consumoPorDispositivosGrupos/:id', authenticate, authorizeByUserId('id'), eac.getConsumoPorDispositivosYGrupos);

// GET /electrical_analysis/consumoPorDispositivosGruposReal/:id - CRÍTICO (requiere autenticación y validación)
router.get('/consumoPorDispositivosGruposReal/:id', authenticate, authorizeByUserId('id'), eac.getConsumoPorDispositivosYGruposReal);

// GET /electrical_analysis/consumoPorDispositivosYGruposPorUsuarioConRango/:id - Consumo por usuario con rango (requiere autenticación y validación)
router.get('/consumoPorDispositivosYGruposPorUsuarioConRango/:id', authenticate, authorizeByUserId('id'), eac.getConsumoPorDispositivosYGruposPorUsuarioConRango);

// GET /electrical_analysis/historial_resumen/:idUsuario - Historial resumido por usuario (requiere autenticación y validación)
router.get("/historial_resumen/:idUsuario", authenticate, authorizeByUserId('idUsuario'), eac.getHistorialResumenPorRango);

// GET /electrical_analysis/historial_detallado/:idUsuario - CRÍTICO: Historial detallado por usuario (requiere autenticación y validación)
router.get("/historial_detallado/:idUsuario", authenticate, authorizeByUserId('idUsuario'), eac.getHistorialDetalladoPorRango);

// GET /electrical_analysis/dispositivo/:idSensor/consumo-actual-por-rango - Consumo por rango (requiere autenticación)
router.get('/dispositivo/:idSensor/consumo-actual-por-rango', authenticate, eac.getConsumoPorRango);

// POST /electrical_analysis/mediciones/guardar - Guardar mediciones (requiere autenticación)
router.post('/mediciones/guardar', authenticate, createMeasurement);

// Opcional: Solo mostrar error 404 para rutas no encontradas
router.use((req, res) => {
    res.status(404).json({ 
      success: false,
      error: 'Ruta de analisis electrico no encontrada: ' + req.url 
    });
});

export default router;
