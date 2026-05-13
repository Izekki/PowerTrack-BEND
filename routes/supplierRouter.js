import express from "express";
import { getAllSuppliers, getSupplier, registerSupplier, updateSupplier, deleteSupplier } from "../controllers/supplierController.js";
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllSuppliers);

router.get('/:id', getSupplier);

router.post('/', authenticate, registerSupplier);

router.patch('/:id', authenticate, updateSupplier);

router.delete('/:id', authenticate, deleteSupplier);

export default router;