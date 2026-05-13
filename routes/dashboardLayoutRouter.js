import { Router } from 'express';
import { dashboardLayoutController } from '../controllers/dashboardLayoutController.js';
import { authenticate, authorizeByUserId } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /user/dashboard-config/:userId - ALTO: Obtener configuración del dashboard (requiere autenticación y validación)
router.get('/:userId', authenticate, authorizeByUserId('userId'), dashboardLayoutController.getLayout);

// POST /user/dashboard-config/:userId - ALTO: Guardar configuración del dashboard (requiere autenticación y validación)
router.post('/:userId', authenticate, authorizeByUserId('userId'), dashboardLayoutController.saveLayout);

export default router;