import express from 'express';
import { loginUser } from '../controllers/loginController.js';
import { validateLogin } from '../middlewares/loginMiddleware.js';

const router = express.Router();

router.post('/', validateLogin, loginUser);

export default router;