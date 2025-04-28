import express from 'express';
import { getSensors,getSensorById, verifySensor } from '../controllers/sensorController.js';
import { createMeasurement } from '../controllers/measurementController.js';

const router = express.Router();


router.get('/obtener', getSensors);
router.get('/byId/:id',getSensorById)
router.post('/verify',verifySensor)
router.post('/measurements',createMeasurement)


export default router;