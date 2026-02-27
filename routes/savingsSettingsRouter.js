import express from 'express';
import {
  createConfiguracion,
  getConfiguracionByDevice,
  updateConfiguracion,
  getConfiguracionesAhorroPorUsuario,
  postUpdateMinMax
} from '../controllers/savingsSettinsController.js';
import { authenticate, authorizeByUserId } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /savsetting/create - Crear configuración inicial (requiere autenticación)
router.post('/create', authenticate, createConfiguracion);

// GET /savsetting/:dispositivo_id - Obtener configuración por dispositivo (requiere autenticación)
router.get('/:dispositivo_id', authenticate, getConfiguracionByDevice);

// PUT /savsetting/:dispositivo_id - Actualizar configuración por dispositivo (requiere autenticación)
router.put('/:dispositivo_id', authenticate, updateConfiguracion);

// GET /savsetting/configuraciones/usuario/:usuario_id - ALTO: Obtener configuraciones por usuario (requiere autenticación y validación)
router.get('/configuraciones/usuario/:usuario_id', authenticate, authorizeByUserId('usuario_id'), getConfiguracionesAhorroPorUsuario);

// POST /savsetting/update-minmax - Actualizar min y max (requiere autenticación)
router.post('/update-minmax', authenticate, postUpdateMinMax);

export default router;
