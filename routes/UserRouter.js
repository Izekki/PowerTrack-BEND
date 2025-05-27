import express from 'express';
import { validateRegister } from '../middlewares/registerMiddleware.js';
import {authenticate} from '../middlewares/authMiddleware.js'
import generateUserReport from '../controllers/reportController.js';
import { userController,getProfileById,updateProfile,changePassword } from '../controllers/userController.js';

const router = express.Router();

let user = new userController();

router.post('/register', validateRegister, user.register);

router.get('/show/:id', getProfileById);

router.put('/edit/:id',authenticate, updateProfile);

router.post('/:id/change-password',authenticate,changePassword);

router.post('/reports/:idUsuario',generateUserReport);


router.use((req, res) => {
  res.status(404).send({ error: 'Ruta de usuario no encontrada' })
})

export default router;