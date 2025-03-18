import express from 'express';
import { editDevice, addDevice } from '../controllers/deviceController.js';
import { validateDevice } from '../middlewares/validateDeviceMiddleware.js';

const router = express.Router();

router.post('/devices', validateDevice, addDevice);

router.put('/devices/:id', validateDevice, editDevice);

export default router;
