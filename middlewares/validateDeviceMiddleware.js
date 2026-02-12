import { getDeviceByName } from '../models/deviceModel.js';  // Ajusta la ruta según corresponda
import { findSensorByMac } from '../models/sensorModel.js';

export const validateDevice = async (req, res, next) => {
  console.log("Datos recibidos en la solicitud:", req.body);
  const { nombre, ubicacion, usuario_id, id_grupo, id_sensor } = req.body;

  // Validación de campos obligatorios
  if (!nombre || !usuario_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Validación de tipos de datos
  const usuarioIdNum = parseInt(usuario_id, 10);
  const idGrupoNum = id_grupo ? parseInt(id_grupo, 10) : null;

  if (isNaN(usuarioIdNum) || (idGrupoNum !== null && isNaN(idGrupoNum))) {
    return res.status(400).json({ message: 'usuario_id e id_grupo deben ser números o id_grupo puede ser null' });
  }

  // Validar que no se repita la MAC
  if (id_sensor) {
    const macSensor = await findSensorByMac(id_sensor); // id_sensor contendrá la MAC directamente
    if (macSensor) {
      return res.status(400).json({ message: 'La dirección MAC ya se encuentra asociada a un dispositivo' });
    }

    // Validar formato MAC
    const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
    if (!macRegex.test(id_sensor)) {
      return res.status(400).json({ message: 'Formato de dirección MAC inválido (00:00:00:00:00:00)' });
    }
  }


  try {
    // Verificación de dispositivo duplicado
    const existingDevice = await getDeviceByName(nombre, usuario_id);
    
    if (existingDevice) {
      return res.status(400).json({ message: 'Error: El dispositivo ya existe en la base de datos.' });
    }

    await next(); // Continúa con la solicitud si no está duplicado
  } catch (error) {
    res.status(500).json({ message: 'Error al validar el dispositivo', error });
  }
};


  