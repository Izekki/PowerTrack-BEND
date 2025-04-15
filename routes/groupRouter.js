import express from "express";
import {createGroups, getAllGroups, editGroup,allGroupsForUser,getGroupDevices,deleteGroupFromId} from '../controllers/groupController.js';

const router = express.Router();

router.post('/create', createGroups);

router.get('/group', getAllGroups);

router.put('/edit', editGroup);

router.get('/byUser/:usuarioId', allGroupsForUser);

router.get('/grupo/:grupoId/dispositivos', getGroupDevices);

router.delete('/deleteGroup/:id',deleteGroupFromId);


export default router;