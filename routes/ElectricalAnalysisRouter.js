import express from 'express';
import ElectricalAnalysisController from '../controllers/ElectricalAnalysisController.js';

const router = express.Router();
const eac = new ElectricalAnalysisController(); 

router.get('/', eac.getInfoApi);
router.get('/voltaje_d/:id', eac.getVoltaje);
router.get('/corriente_d/:id', eac.getCorriente);
router.get('/potencia_activa_d/:id', eac.getPotenciaActiva);
router.get('/frecuencia_d/:id', eac.getFrecuencia);
router.get('/factor_potencia_d/:id', eac.getFactorPotencia);
router.get('/consumo_d/:id', eac.getConsumo);
router.get('/dispositivo/:id/consumo-actual',eac.getConsumoActual);
router.get('/dispositivosPorUsuarios/:idUsuario/consumo-actual',eac.getDispositivosPorUsuarioConsumo);
router.get('/dispositivo/:id/consumo-detallado',eac.getConsumoDetalladoPorDispositivo);
router.get('/consumoPorDispositivosGrupos/:id',eac.getConsumoPorDispositivosYGrupos);
router.get('/consumoPorDispositivosYGruposPorUsuarioConRango/:id',eac.getConsumoPorDispositivosYGruposPorUsuarioConRango);
router.get("/historial_resumen/:idUsuario", eac.getHistorialResumenPorRango);
router.get("/historial_detallado/:idUsuario", eac.getHistorialDetalladoPorRango);

router.get('/dispositivo/:idSensor/consumo-actual-por-rango',eac.getConsumoPorRango)





router.use((req, res) => {
    res.status(404).send({ error: 'Ruta de analisis electrico no encontrada: ' + req.url })
  })

export default router;
