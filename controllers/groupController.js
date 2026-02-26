import {createGroup, getGroups,editGroupBD,allGroupsForUserBD,getGroupDevicesBD,deleteGroupFromIdDB} from '../models/groupModel.js';

export const createGroups = async (req, res) => {
    const { name, devices, usuarioId } = req.body;
    const authenticatedUserId = req.user.userId;
    
    // Validar que el usuarioId en el body coincida con el del token
    if (parseInt(usuarioId) !== authenticatedUserId) {
        return res.status(403).json({ 
            success: false,
            message: "No tienes permiso para crear grupos para otros usuarios" 
        });
    }

    if (!name) {
        return res.status(400).json({ 
            success: false,
            message: "Nombre requerido" 
        });
    }
    if (!Array.isArray(devices) || devices.length === 0) {
        return res.status(400).json({ 
            success: false,
            message: "Debes proporcionar un arreglo de dispositivos" 
        });
    }
    if (!usuarioId) {
        return res.status(400).json({ 
            success: false,
            message: "Id de usuario requerido" 
        });
    }

    try {
        const newGroup = await createGroup(name, devices, usuarioId);
        res.status(201).json({ 
            success: true,
            message: "Grupo creado exitosamente", 
            newGroup 
        });
    } catch (error) {
        if (error.message.includes("Ya existe un grupo con ese nombre")) {
            return res.status(400).json({ 
                success: false,
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor" 
        });
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
        const authenticatedUserId = req.user.userId;

        // Validar que el usuarioId en el body coincida con el del token
        if (parseInt(usuarioId) !== authenticatedUserId) {
            return res.status(403).json({ 
                success: false,
                message: "No tienes permiso para editar grupos de otros usuarios" 
            });
        }

        const group = await editGroupBD(id, name, devices, usuarioId);
        res.status(200).json({
            success: true,
            message: "Grupo editado exitosamente", 
            group
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error al editar el grupo', 
            error: error.message
        });
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

        // Siempre devolver arreglo (aunque esté vacío) para evitar romper el cliente
        res.status(200).json(Array.isArray(groups) ? groups : []);

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
    const authenticatedUserId = req.user.userId;
  
    if (isNaN(groupId)) {
      return res.status(400).json({ 
        success: false,
        error: 'ID de grupo inválido' 
      });
    }
  
    try {
      // Obtener el grupo y validar que pertenece al usuario autenticado
      const groups = await allGroupsForUserBD(authenticatedUserId);
      const group = groups?.find(g => g.id === groupId);

      if (!group) {
        return res.status(404).json({ 
          success: false,
          error: 'Grupo no encontrado' 
        });
      }

      // Validar que el grupo pertenece al usuario autenticado
      if (group.usuario_id !== authenticatedUserId) {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permiso para eliminar este grupo' 
        });
      }

      const result = await deleteGroupFromIdDB(groupId, authenticatedUserId);
      res.status(200).json({ 
        success: true,
        message: 'Grupo eliminado correctamente',
        data: result 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };