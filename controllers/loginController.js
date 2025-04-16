import jwt from 'jsonwebtoken';
import { getUserByEmail, validatePassword } from '../models/loginModel.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isValidPassword = await validatePassword(password, user.contraseña);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.correo
      }, 
      process.env.JWT_SECRET || 'tu_secreto_secreto', 
      { expiresIn: '1h' }
    );

    //req.session.userId = user.id;

    res.status(200).json({ 
      message: 'Inicio de sesión exitoso', 
      userId: user.id,
      token: token // Enviamos el token al frontend
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};