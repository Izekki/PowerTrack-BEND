import express from 'express';
import {getSensorByUser} from '../controllers/sensorController';

const router = express.Router();


router.get('/obtener',getSensorByUser);
