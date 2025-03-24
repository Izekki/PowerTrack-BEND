import express from 'express';
import { getDeviceById,editDevice, addDevice, getDevices,getUnassignedDevices } from '../controllers/deviceController.js';
import { validateDevice } from '../middlewares/validateDeviceMiddleware.js';

const router = express.Router();

router.post('/devices', validateDevice, addDevice);

<<<<<<< HEAD

router.put('/editar/:id', validateDevice, editDevice);
=======
router.put('/editar/:id',editDevice);
>>>>>>> a0afad7c83220b7041a7104909c9b9b0443bd9bf

router.get('/obtenerPorId/:id', getDeviceById);

router.get('/obtener', getDevices);

router.get('/unassigned', getUnassignedDevices);


export default router;
