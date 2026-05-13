import { Router } from 'express';
import { authenticate, authorizeByUserId } from '../middlewares/authMiddleware.js';
import { getUserPreferences, putUserPreferences } from '../controllers/userPreferencesController.js';

const router = Router();

// GET /preferences/:userId - Obtener preferencias del usuario autenticado
router.get('/:userId', authenticate, authorizeByUserId('userId'), getUserPreferences);

// PUT /preferences/:userId - Actualizar preferencias del usuario autenticado
router.put('/:userId', authenticate, authorizeByUserId('userId'), putUserPreferences);

export default router;
