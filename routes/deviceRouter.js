import express from 'express';
import { getDeviceById,editDevice,updateTipoDispositivo,
     addDevice, getDevices,getUnassignedDevices, allDeviceForUser,
     deleteDeviceFromId
     } from '../controllers/deviceController.js';
import { validateDevice } from '../middlewares/validateDeviceMiddleware.js';
import { authenticate, authorizeByUserId } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /device/devices - Crear dispositivo (requiere autenticación y que el userId sea el del token)
router.post('/devices', authenticate, validateDevice, addDevice);

// PUT /device/editar/:id - Editar dispositivo (requiere autenticación)
router.put('/editar/:id', authenticate, editDevice);

// GET /device/obtenerPorId/:id - Obtener dispositivo por ID (requiere autenticación)
router.get('/obtenerPorId/:id', authenticate, getDeviceById);

// GET /device/obtener - Obtener todos los dispositivos (requiere autenticación)
router.get('/obtener', authenticate, getDevices);

// GET /device/dispositivosPorUsuario/:id - CRÍTICO: Obtener dispositivos por usuario (requiere autenticación y validar que sea el mismo usuario)
router.get('/dispositivosPorUsuario/:id', authenticate, authorizeByUserId('id'), allDeviceForUser);

// GET /device/unassigned/:id - Obtener dispositivos sin asignar (requiere autenticación)
router.get('/unassigned/:id', authenticate, getUnassignedDevices);

// PUT /device/editar/icono/:id - Actualizar icono/tipo de dispositivo (requiere autenticación)
router.put("/editar/icono/:id", authenticate, updateTipoDispositivo);

// DELETE /device/deleteDevice/:id - CRÍTICO: Eliminar dispositivo (requiere autenticación y validar propiedad)
router.delete('/deleteDevice/:id', authenticate, deleteDeviceFromId);


export default router;
