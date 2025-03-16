import express from 'express';
import { editDevice } from '../controllers/deviceController.js';
import { validateDevice } from '../middlewares/validateDeviceMiddleware.js';

const router = express.Router();

router.put('/devices/:id', validateDevice, editDevice);

export default router;
