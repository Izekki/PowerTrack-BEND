// passwordRecovery.routes.js
import { Router } from 'express';
import { 
  requestPasswordRecovery, 
  validateRecoveryToken, 
  resetPassword 
} from '../controllers/passwordRecoveryController.js';
import {
  passwordRecoveryRequestRateLimit,
  passwordRecoveryResetRateLimit,
} from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// Ruta para solicitar recuperación de contraseña
router.post('/recover-password', passwordRecoveryRequestRateLimit, requestPasswordRecovery);

// Ruta para verificar si un token es válido
router.get('/verify-token/:token', validateRecoveryToken);

// Ruta para restablecer la contraseña
router.post('/reset-password', passwordRecoveryResetRateLimit, resetPassword);

export default router;