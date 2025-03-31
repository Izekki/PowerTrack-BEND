import { getDeviceByName } from '../models/deviceModel.js';  // Ajusta la ruta según corresponda


export const validateDevice = async (req, res, next) => {
  console.log("Datos recibidos en la solicitud:", req.body);
  const { nombre, ubicacion, usuario_id, id_grupo } = req.body;

  // Validación de campos obligatorios
  if (!nombre || !ubicacion || !usuario_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Validación de tipos de datos
  const usuarioIdNum = parseInt(usuario_id, 10);
const idGrupoNum = id_grupo ? parseInt(id_grupo, 10) : null;

if (isNaN(usuarioIdNum) || (idGrupoNum !== null && isNaN(idGrupoNum))) {
  return res.status(400).json({ message: 'usuario_id e id_grupo deben ser números o id_grupo puede ser null' });
}


  try {
    // Verificación de dispositivo duplicado
    const existingDevice = await getDeviceByName(nombre);
    
    if (existingDevice) {
      return res.status(400).json({ message: 'Error: El dispositivo ya existe en la base de datos.' });
    }

    await next(); // Continúa con la solicitud si no está duplicado
  } catch (error) {
    res.status(500).json({ message: 'Error al validar el dispositivo', error });
  }
};


  