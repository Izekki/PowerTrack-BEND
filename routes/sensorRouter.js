import express from 'express';
import { getSensors,getSensorById } from '../controllers/sensorController.js';

const router = express.Router();


router.get('/obtener', getSensors);
router.get('/byId/:id',getSensorById)


export default router;