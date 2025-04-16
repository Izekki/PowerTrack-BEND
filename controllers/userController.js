import { userModel,getProfileByIdDB,updateProfileDB,changePasswordDB } from '../models/userModel.js';
import DBConnectionError from '../models/modelserror/DBConnectionError.js';
import DBElementAlredyExists from '../models/modelserror/DBElementAlredyExists.js';

export class userController {

    register = async (req, res) => {
        let { nombre, correo, contraseña, proveedor} = req.body;
        nombre = nombre.trim();
        correo = correo.trim();

        try {
            const newUser = await userModel.register({ input: { nombre, correo, contraseña, proveedor} });
            
            return res.status(201).json({message:"Usuario creado con exito", user:newUser});
    
        } catch (error) {
            if (error instanceof DBConnectionError || error instanceof DBElementAlredyExists) {
                                       
                return res.status(error.statusCode).json({ message: error.message, tipo: "Datos enviados"});
            } else {
                return res.status(500).json({ message: "Error interno del servidor" + error.message});
            }
         }
    }

}

export const getProfileById = async (req, res) => {
    try {
        const userId = req.params.id;
        const userProfile = await getProfileByIdDB(userId);
        
        res.json({
            success: true,
            data: userProfile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Validar que el usuario solo pueda editar su propio perfil
        if (req.user.userId !== parseInt(userId)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar este perfil'
            });
        }

        const updateData = req.body;
        const updatedProfile = await updateProfileDB(userId, updateData);
        
        res.json({
            success: true,
            data: updatedProfile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;

        // Validar que el usuario solo pueda cambiar su propia contraseña
        if (req.user.userId !== parseInt(userId)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para realizar esta acción'
            });
        }

        // Validaciones adicionales
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren ambas contraseñas'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 8 caracteres'
            });
        }

        await changePasswordDB(userId, currentPassword, newPassword);
        
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