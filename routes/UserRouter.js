import express from 'express';
import { validateRegister } from '../middlewares/registerMiddleware.js';
import { authenticate, authorizeByUserId } from '../middlewares/authMiddleware.js'
import generateUserReport from '../controllers/reportController.js';
import { userController,getProfileById,updateProfile,changePassword } from '../controllers/userController.js';

const router = express.Router();

let user = new userController();

// POST /user/register - Registrar nuevo usuario (sin autenticación requerida)
router.post('/register', validateRegister, user.register);

// GET /user/show/:id - Obtener perfil del usuario (requiere autenticación y validación)
router.get('/show/:id', authenticate, authorizeByUserId('id'), getProfileById);

// PUT /user/edit/:id - ALTO: Editar perfil del usuario (requiere autenticación y validación)
router.put('/edit/:id', authenticate, authorizeByUserId('id'), updateProfile);

// POST /user/:id/change-password - ALTO: Cambiar contraseña (requiere autenticación y validación)
router.post('/:id/change-password', authenticate, authorizeByUserId('id'), changePassword);

// POST /user/reports/:idUsuario - Generar reporte de usuario (requiere autenticación)
router.post('/reports/:idUsuario', authenticate, generateUserReport);

router.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Ruta de usuario no encontrada' 
  });
});

export default router;