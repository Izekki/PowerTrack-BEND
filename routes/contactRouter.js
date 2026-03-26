import { Router } from 'express';
import { sendContactMessage } from '../controllers/contactController.js';
import { contactRateLimit, validateContactPayload } from '../middlewares/contactMiddleware.js';

const router = Router();

router.post('/', contactRateLimit, validateContactPayload, sendContactMessage);

export default router;
