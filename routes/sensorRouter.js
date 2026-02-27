import express from 'express';
import { getSensors,getSensorById, verifySensor } from '../controllers/sensorController.js';
import { createMeasurement } from '../controllers/measurementController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /sensor/obtener - Obtener todos los sensores (requiere autenticación)
router.get('/obtener', authenticate, getSensors);

// GET /sensor/byId/:id - Obtener sensor por ID (requiere autenticación)
router.get('/byId/:id', authenticate, getSensorById);

// POST /sensor/verify - Verificar sensor (requiere autenticación)
router.post('/verify', authenticate, verifySensor);

// POST /sensor/measurements - Crear medición (requiere autenticación)
router.post('/measurements', authenticate, createMeasurement);

export default router;