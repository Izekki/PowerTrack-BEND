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

    res.status(200).json({ message: 'Inicio de sesión exitoso', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};