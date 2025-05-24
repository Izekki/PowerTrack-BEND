import express from 'express';
import {
  createConfiguracion,
  getConfiguracionByDevice,
  updateConfiguracion
} from '../controllers/savingsSettinsController.js';

const router = express.Router();

// Crear configuración inicial manualmente
router.post('/create', createConfiguracion);

// Obtener configuración por dispositivo
router.get('/:dispositivo_id', getConfiguracionByDevice);

// Actualizar configuración por dispositivo
router.put('/:dispositivo_id', updateConfiguracion);

export default router;
