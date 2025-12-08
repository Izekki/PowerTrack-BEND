import { Router } from 'express';
import { dashboardLayoutController } from '../controllers/dashboardLayoutController.js';

const router = Router();

// GET: Obtener configuración
router.get('/:userId', dashboardLayoutController.getLayout);

// POST: Guardar configuración
router.post('/:userId', dashboardLayoutController.saveLayout);

export default router;