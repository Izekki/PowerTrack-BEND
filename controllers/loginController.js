import jwt from 'jsonwebtoken';
import { getUserByEmail, validatePassword } from '../models/loginModel.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validar que los campos requeridos estén presentes
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'El correo electrónico y la contraseña son requeridos' 
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'El correo electrónico o contraseña es incorrecta' 
      });
    }

    const isValidPassword = await validatePassword(password, user.contraseña);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'El correo electrónico o contraseña es incorrecta' 
      });
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
      success: true,
      message: 'Inicio de sesión exitoso', 
      userId: user.id,
      nombre: user.nombre,
      token: token // Enviamos el token al frontend
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
};