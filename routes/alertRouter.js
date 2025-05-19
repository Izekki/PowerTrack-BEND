import express from 'express';
import AlertaController from '../controllers/AlertaController.js';

const router = express.Router();


// Obtener todas las alertas del usuario
router.get('/usuario/:usuarioId', AlertaController.obtenerPorUsuario);

// Generar alertas automáticas al registrar un dispositivo
router.post('/generar', AlertaController.generarPorTipoDispositivo);

// Crear alerta manual
router.post('/', AlertaController.crear);

// Eliminar alerta
router.delete('/:id/usuario/:usuarioId', AlertaController.eliminar);

export default router;
