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

//Marcar alertas como leidas
router.put('/marcar-leidas/:usuarioId', AlertaController.marcarLeidas);

//Verificar alertas no leidas
router.get('/verificar-nuevas/:usuarioId', AlertaController.verificarNuevas);

//Marcar SOLO una alerta
router.put('/marcar-una/:alertaId', AlertaController.marcarUnaLeida);


export default router;
