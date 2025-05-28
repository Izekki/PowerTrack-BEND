import express from 'express';
import {
  createConfiguracion,
  getConfiguracionByDevice,
  updateConfiguracion,
  getConfiguracionesAhorroPorUsuario,
  postUpdateMinMax
} from '../controllers/savingsSettinsController.js';

const router = express.Router();

// Crear configuración inicial manualmente
router.post('/create', createConfiguracion);

// Obtener configuración por dispositivo
router.get('/:dispositivo_id', getConfiguracionByDevice);

// Actualizar configuración por dispositivo
router.put('/:dispositivo_id', updateConfiguracion);

//Obtener todas las configuracion de dispositivos por usuario
router.get('/configuraciones/usuario/:usuario_id', getConfiguracionesAhorroPorUsuario);

//Actualizar min y max
router.post('/update-minmax',postUpdateMinMax)

export default router;
