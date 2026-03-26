import express from 'express';
import { loginUser } from '../controllers/loginController.js';
import { validateLogin } from '../middlewares/loginMiddleware.js';
import { loginRateLimit } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.post('/', loginRateLimit, validateLogin, loginUser);

export default router;