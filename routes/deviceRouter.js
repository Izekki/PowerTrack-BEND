import express from 'express';
import { editDevice, addDevice, getDevices,getUnassignedDevices } from '../controllers/deviceController.js';
import { validateDevice } from '../middlewares/validateDeviceMiddleware.js';

const router = express.Router();

router.post('/devices', validateDevice, addDevice);

router.put('/devices/:id', validateDevice, editDevice);

router.get('/obtener', getDevices);

router.get('/unassigned', getUnassignedDevices);

export default router;
