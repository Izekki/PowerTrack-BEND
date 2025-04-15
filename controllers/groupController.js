import {createGroup, getGroups,editGroupBD,allGroupsForUserBD,getGroupDevicesBD,deleteGroupFromIdDB} from '../models/groupModel.js';

export const createGroups = async (req, res) => {
    const { name, devices, usuarioId } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: "Nombre requerido" });
    }
    if (!Array.isArray(devices) || devices.length === 0) {
        return res.status(400).json({ message: "Debes proporcionar un arreglo de dispositivos" });
    }
    if (!usuarioId) {
        return res.status(400).json({ message: "Id de usuario requerido" });
        }

    try {
        const newGroup = await createGroup(name, devices,usuarioId);
        res.status(201).json({ message: "Grupo creado exitosamente", newGroup });
    } catch (error) {
        if (error.message.includes("Ya existe un grupo con ese nombre")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


export const getAllGroups = async (req, res) => {
    try {
        const groups = await getGroups();
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los grupos', error: error.message });
    }
};

export const editGroup = async (req,res) => {
    try{
        const {id, name, devices, usuarioId} = req.body;
        const group = await editGroupBD(id, name, devices, usuarioId);
        res.status(200).json({message: "Grupo editado exitosamente", group});
    }catch(error){
        res.status(500).json({message: 'Error al editar el grupo', error: error.message});
    }
    
}

export const allGroupsForUser = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        if (!usuarioId || isNaN(usuarioId)) {
            return res.status(400).json({
                message: "ID de usuario inválido",
            });
        }

        const numericUserId = parseInt(usuarioId, 10);
        const groups = await allGroupsForUserBD(numericUserId);

        if (groups.length === 0) {
            return res.status(404).json({
                message: "El usuario no tiene grupos registrados",
            });
        }

        res.status(200).json(groups);

    } catch (error) {
        res.status(500).json({
            message: "Error al obtener los grupos para el usuario",
            error: error.message,
        });
    }
};

export const getGroupDevices = async (req, res) => {
    const grupoId = req.params.grupoId;
    const usuarioId = req.query.usuarioId;
  
    try {
      const dispositivos = await getGroupDevicesBD(grupoId, usuarioId);
      res.json(dispositivos);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener dispositivos del grupo', error: error.message });
    }
  };

  export const deleteGroupFromId = async (req, res) => {
    const groupId = parseInt(req.params.id);
    const usuarioId = parseInt(req.body.usuarioId);
  
    if (isNaN(groupId) || isNaN(usuarioId)) {
      return res.status(400).json({ error: 'ID de grupo o usuario inválido' });
    }
  
    try {
      const result = await deleteGroupFromIdDB(groupId, usuarioId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };