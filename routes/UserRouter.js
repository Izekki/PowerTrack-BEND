import express from 'express';
import { validateRegister } from '../middlewares/registerMiddleware.js';
import { userController } from '../controllers/userController.js';

const router = express.Router();

let user = new userController();

router.post('/register', validateRegister, user.register);

router.use((req, res) => {
  res.status(404).send({ error: 'Ruta de usuario no encontrada' })
})

export default router;