import express from "express";
import {createGroups, getAllGroups, editGroup,allGroupsForUser,getGroupDevices,deleteGroupFromId} from '../controllers/groupController.js';
import { authenticate, authorizeByUserId } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /groups/create - Crear grupo (requiere autenticación)
router.post('/create', authenticate, createGroups);

// GET /groups/group - Obtener todos los grupos (requiere autenticación)
router.get('/group', authenticate, getAllGroups);

// PUT /groups/edit - Editar grupo (requiere autenticación)
router.put('/edit', authenticate, editGroup);

// GET /groups/byUser/:usuarioId - CRÍTICO: Obtener grupos por usuario (requiere autenticación y validación)
router.get('/byUser/:usuarioId', authenticate, authorizeByUserId('usuarioId'), allGroupsForUser);

// GET /groups/grupo/:grupoId/dispositivos - Obtener dispositivos de un grupo (requiere autenticación)
router.get('/grupo/:grupoId/dispositivos', authenticate, getGroupDevices);

// DELETE /groups/deleteGroup/:id - CRÍTICO: Eliminar grupo (requiere autenticación y validación)
router.delete('/deleteGroup/:id', authenticate, deleteGroupFromId);


export default router;