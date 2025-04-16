// middlewares/authMiddleware.js

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config();

export const authenticate = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
          return res.status(401).json({ message: 'Acceso no autorizado. Token requerido.' });
        }
    
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_secreto');
        
        // Añadir el usuario decodificado a la request
        req.user = decoded;
        
        next();
      } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
      }
    };