import express from 'express';
import AlertaController from '../controllers/AlertaController.js';
import { authenticate, authorizeByUserId } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /alertas/usuario/:usuarioId - CRÍTICO: Obtener alertas del usuario (requiere autenticación y validación)
router.get('/usuario/:usuarioId', authenticate, authorizeByUserId('usuarioId'), AlertaController.obtenerPorUsuario);

// POST /alertas/generar - Generar alertas automáticas (requiere autenticación)
router.post('/generar', authenticate, AlertaController.generarPorTipoDispositivo);

// POST /alertas/ - Crear alerta manual (requiere autenticación)
router.post('/', authenticate, AlertaController.crear);

// DELETE /alertas/:id/usuario/:usuarioId - Eliminar alerta (requiere autenticación y validación)
router.delete('/:id/usuario/:usuarioId', authenticate, authorizeByUserId('usuarioId'), AlertaController.eliminar);

// PUT /alertas/marcar-leidas/:usuarioId - Marcar alertas como leídas (requiere autenticación y validación)
router.put('/marcar-leidas/:usuarioId', authenticate, authorizeByUserId('usuarioId'), AlertaController.marcarLeidas);

// GET /alertas/verificar-nuevas/:usuarioId - Verificar alertas no leídas (requiere autenticación y validación)
router.get('/verificar-nuevas/:usuarioId', authenticate, authorizeByUserId('usuarioId'), AlertaController.verificarNuevas);

// PUT /alertas/marcar-una/:alertaId - CRÍTICO: Marcar una alerta como leída (requiere autenticación)
router.put('/marcar-una/:alertaId', authenticate, AlertaController.marcarUnaLeida);


export default router;
