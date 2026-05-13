import { prisma } from '../db/prisma.js';
import DBConnectionError from './modelserror/DBConnectionError.js';
import NotFoundError from './modelserror/NotFoundError.js';

const ensureUserExists = async (userId) => {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
};

export const getOrCreateUserPreferencesDB = async (userId) => {
  try {
    await ensureUserExists(userId);

    return await prisma.userPreferences.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: {
        contrastLevel: true,
        theme: true
      }
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new DBConnectionError(`Error al obtener preferencias del usuario: ${error.message}`);
  }
};

export const updateUserPreferencesDB = async (userId, updateData) => {
  try {
    await ensureUserExists(userId);

    return await prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData
      },
      select: {
        contrastLevel: true,
        theme: true
      }
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new DBConnectionError(`Error al actualizar preferencias del usuario: ${error.message}`);
  }
};
