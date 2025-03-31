import express from "express";
import { getAllSuppliers, getSupplier, registerSupplier, updateSupplier, deleteSupplier } from "../controllers/supplierController.js";

const router = express.Router();

router.get('/', getAllSuppliers);

router.get('/:id', getSupplier);

router.post('/', registerSupplier);

router.patch('/:id', updateSupplier);

router.delete('/:id', deleteSupplier);

export default router;