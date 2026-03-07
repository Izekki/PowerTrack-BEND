import ValidationError from '../models/modelserror/ValidationError.js';
import NotFoundError from '../models/modelserror/NotFoundError.js';
import DBConnectionError from '../models/modelserror/DBConnectionError.js';
import { getOrCreateUserPreferencesDB, updateUserPreferencesDB } from '../models/userPreferencesModel.js';

const ALLOWED_CONTRAST_LEVELS = ['normal', 'high', 'very-high'];
const ALLOWED_THEMES = ['light', 'dark'];

const parseUserId = (userIdParam) => {
  const userId = Number(userIdParam);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ValidationError('El userId debe ser un entero positivo');
  }

  return userId;
};

export const getUserPreferences = async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);
    const preferences = await getOrCreateUserPreferencesDB(userId);

    return res.json(preferences);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DBConnectionError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const putUserPreferences = async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);
    const { contrastLevel, theme } = req.body;

    if (contrastLevel === undefined && theme === undefined) {
      throw new ValidationError('Debe enviar al menos un campo para actualizar: contrastLevel o theme');
    }

    const updateData = {};

    if (contrastLevel !== undefined) {
      if (!ALLOWED_CONTRAST_LEVELS.includes(contrastLevel)) {
        throw new ValidationError('contrastLevel inválido. Valores permitidos: normal, high, very-high');
      }
      updateData.contrastLevel = contrastLevel;
    }

    if (theme !== undefined) {
      if (!ALLOWED_THEMES.includes(theme)) {
        throw new ValidationError('theme inválido. Valores permitidos: light, dark');
      }
      updateData.theme = theme;
    }

    const updatedPreferences = await updateUserPreferencesDB(userId, updateData);

    return res.json(updatedPreferences);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DBConnectionError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
