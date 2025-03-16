import express from "express";
import {createGroups} from '../controllers/groupController.js';

const router = express.Router();
router.post('/create', createGroups);
export default router;