// passwordRecoveryController.js
import { 
    createPasswordRecoveryRequest, 
    verifyRecoveryToken, 
    updateUserPassword 
  } from '../models/passwordRecoveryModel.js'
  import { sendMail } from '../utils/mailService.js';
  import dotenv from 'dotenv';
  import NotFoundError from '../models/modelserror/NotFoundError.js';
  import ValidationError from '../models/modelserror/ValidationError.js';
  import DBConnectionError from '../models/modelserror/DBConnectionError.js';

  dotenv.config();
  
  // Solicitar recuperación de contraseña
  export const requestPasswordRecovery = async (req, res) => {
    try {
      const { correo } = req.body;
      
      if (!correo) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico es obligatorio'
        });
      }
  
      const recoveryData = await createPasswordRecoveryRequest(correo);
      
      const resetLink = `${process.env.URL_FRONT}/reset-password/${recoveryData.token}`;
      
      // Aquí implementarías el envío real del correo
      await sendMail({
        to: correo,
        subject: 'Recuperación de contraseña',
        html: `
          <h1>Recuperación de contraseña</h1>
          <p>Hola ${recoveryData.usuario.nombre},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetLink}">Restablecer contraseña</a>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Si no solicitaste este cambio, ignora este correo.</p>
        `
      });
  
      res.json({
        success: true,
        message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña'
      });
    } catch (error) {
      // Manejar usuario no encontrado
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al procesar solicitud de recuperación'
      });
    }
  };
  
  // Verificar token de recuperación
  export const validateRecoveryToken = async (req, res) => {
    try {
      const { token } = req.params;
      
      const tokenData = await verifyRecoveryToken(token);
      
      res.json({
        success: true,
        data: {
          usuario: {
            id: tokenData.usuario.id,
            correo: tokenData.usuario.correo
          }
        },
        message: 'Token válido'
      });
    } catch (error) {
      // Manejar token inválido o expirado
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al verificar el token'
      });
    }
  };
  
  // Restablecer contraseña
  export const resetPassword = async (req, res) => {
    try {
      const { token, nuevaPassword, confirmarPassword } = req.body;
      
      if (!token || !nuevaPassword || !confirmarPassword) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios'
        });
      }
      
      if (nuevaPassword !== confirmarPassword) {
        return res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden'
        });
      }

      if (nuevaPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      if (nuevaPassword.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña no puede tener más de 20 caracteres'
        });
      }
      
      // Verificar que el token sea válido
      const tokenData = await verifyRecoveryToken(token);
      
      // Actualizar la contraseña
      await updateUserPassword(tokenData.usuario.id, nuevaPassword);
      
      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      // Manejar token inválido o expirado
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar la contraseña'
      });
    }
  };