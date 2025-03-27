import express from 'express';
import { getDeviceById,editDevice, addDevice, getDevices,getUnassignedDevices, allDeviceForUser } from '../controllers/deviceController.js';
import { validateDevice } from '../middlewares/validateDeviceMiddleware.js';

const router = express.Router();

router.post('/devices', validateDevice, addDevice);

router.put('/editar/:id',editDevice);

router.get('/obtenerPorId/:id', getDeviceById);

router.get('/obtener', getDevices);

router.get('/dispositivosPorUsuario/:id', allDeviceForUser);

router.get('/unassigned', getUnassignedDevices);


export default router;
