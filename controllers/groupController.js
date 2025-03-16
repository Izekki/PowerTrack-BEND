import {createGroup} from '../models/groupModel.js';

export const createGroups = async (req,res) => {
    const {name,id_dispositivo} = req.body;

    if(!name){
        return res.status(400).json({message: "Nombre requerido "});
    }
    try{
        const newGroup = await createGroup(name,id_dispositivo);
        res.status(201).json({message: "Grupo creado exitosamente", newGroup});
    }catch(error){
        res.status(500).json({error: error.message});
    }
    
    
}
