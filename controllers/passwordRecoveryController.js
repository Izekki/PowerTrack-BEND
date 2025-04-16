// passwordRecoveryController.js
import { 
    createPasswordRecoveryRequest, 
    verifyRecoveryToken, 
    updateUserPassword 
  } from '../models/passwordRecoveryModel.js'
  import { sendMail } from '../utils/mailService.js'
  
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
      
      // En un entorno real, enviarías un email con el enlace de recuperación
      // Por ahora solo simulamos el envío
      const resetLink = `http://localhost:5173/reset-password/${recoveryData.token}`;
      
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
      res.status(500).json({
        success: false,
        message: error.message
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
      res.status(400).json({
        success: false,
        message: error.message
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
      
      // Verificar que el token sea válido
      const tokenData = await verifyRecoveryToken(token);
      
      // Actualizar la contraseña
      await updateUserPassword(tokenData.usuario.id, nuevaPassword);
      
      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };