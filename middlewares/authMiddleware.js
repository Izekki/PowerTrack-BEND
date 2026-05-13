// middlewares/authMiddleware.js

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware de autenticación - Verifica que el token sea válido
 */
export const authenticate = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
          return res.status(401).json({ 
            success: false,
            message: 'Token no proporcionado. Acceso no autorizado.' 
          });
        }
    
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Añadir el usuario decodificado a la request
        req.user = decoded;
        
        next();
      } catch (error) {
        return res.status(401).json({ 
          success: false,
          message: 'Token inválido o expirado' 
        });
      }
};

/**
 * Middleware de autorización - Valida que el userId en los parámetros/body
 * coincida con el userId del token autenticado
 * Parámetro: nombreDelParametro (ej: 'id', 'userId', 'usuarioId')
 */
export const authorizeByUserId = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      // Obtener el userId solicitado (puede estar en params, query o body)
      const requestedUserId = req.params[paramName] || req.query[paramName] || req.body[paramName];
      
      // userId del token autenticado
      const authenticatedUserId = req.user.userId;

      // Convertir a string para comparación segura
      const requestedUserIdStr = String(requestedUserId);
      const authenticatedUserIdStr = String(authenticatedUserId);

      // Validar que el userId solicitado coincida con el del token
      if (requestedUserIdStr !== authenticatedUserIdStr) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a estos datos'
        });
      }

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error en validación de autorización'
      });
    }
  };
};

/**
 * Middleware híbrido para endpoints de ingesta de sensores.
 * Acepta:
 * 1) JWT de usuario (flujo normal app/web)
 * 2) Token de gateway/sensor (flujo dispositivo -> backend)
 */
export const authenticateUserOrSensorIngest = (req, res, next) => {
  const authorizationHeader = req.header('Authorization');
  const bearerToken = authorizationHeader?.replace('Bearer ', '');

  // 1) Intentar autenticación JWT de usuario si viene un Bearer token
  if (bearerToken) {
    try {
      const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (_) {
      // Si no es JWT válido, seguimos para intentar token de ingesta
    }
  }

  // 2) Validar token de ingesta por header dedicado o por Bearer
  const ingestToken = req.header('x-sensor-token') || bearerToken;
  const expectedIngestToken = process.env.SENSOR_INGEST_TOKEN;

  if (!expectedIngestToken) {
    return res.status(500).json({
      success: false,
      message: 'SENSOR_INGEST_TOKEN no configurado en el servidor.'
    });
  }

  if (!ingestToken) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado. Acceso no autorizado.'
    });
  }

  if (ingestToken !== expectedIngestToken) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }

  req.sensorIngest = true;
  return next();
};