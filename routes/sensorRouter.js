import express from 'express';
import { getSensors,getSensorById, verifySensor } from '../controllers/sensorController.js';

const router = express.Router();


router.get('/obtener', getSensors);
router.get('/byId/:id',getSensorById)
router.post('/verify',verifySensor)


export default router;