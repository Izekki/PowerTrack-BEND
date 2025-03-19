import express from "express";
import {createGroups, getAllGroups} from '../controllers/groupController.js';

const router = express.Router();

router.post('/create', createGroups);

router.get('/group', getAllGroups);

export default router;