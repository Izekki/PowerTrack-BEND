import { userModel } from '../models/userModel.js';
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