import { 
  insertConfiguracionAhorro, 
  fetchConfiguracionByDevice, 
  updateConfiguracionByDevice,
  getConfiguracionesPorUsuario,
  updateConfiguracionAhorroMinAndMax
} from '../models/savingsSettinsModel.js';

// Crear configuración (generalmente lo usarás al crear dispositivo)
export const createConfiguracion = async (req, res) => {
  const { usuario_id, dispositivo_id, minimo, maximo, clave_alerta, mensaje } = req.body;

  try {
    const [result] = await insertConfiguracionAhorro(usuario_id, dispositivo_id, minimo, maximo, clave_alerta, mensaje);

    res.status(201).json({
      message: 'Configuración de ahorro creada exitosamente',
      config_id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear configuración:', error);
    res.status(500).json({ message: 'Error al crear configuración', error });
  }
};

// Obtener configuración por dispositivo
export const getConfiguracionByDevice = async (req, res) => {
  const { dispositivo_id } = req.params;

  try {
    const rows = await fetchConfiguracionByDevice(dispositivo_id);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontró configuración para este dispositivo' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ message: 'Error al obtener configuración', error });
  }
};

// Actualizar configuración por dispositivo
export const updateConfiguracion = async (req, res) => {
  const { dispositivo_id } = req.params;
  const { minimo, maximo, clave_alerta, mensaje } = req.body;

  try {
    const [result] = await updateConfiguracionByDevice(dispositivo_id, minimo, maximo, clave_alerta, mensaje);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró configuración para actualizar' });
    }

    res.status(200).json({ message: 'Configuración actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ message: 'Error al actualizar configuración', error });
  }
};

export const getConfiguracionesAhorroPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const configuraciones = await getConfiguracionesPorUsuario(usuario_id);

    if (!configuraciones.length) {
      return res.status(404).json({
        message: 'No se encontraron configuraciones para este usuario'
      });
    }
    const formattedConfiguraciones = configuraciones.map(conf => ({
      ...conf,
      minimo: parseFloat(conf.minimo),
      maximo: parseFloat(conf.maximo)
    }));

    return res.json({
      total: formattedConfiguraciones.length,
      configuraciones: formattedConfiguraciones
    });

  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    return res.status(500).json({ error: 'Error al obtener las configuraciones' });
  }
};


export const postUpdateMinMax = async (req, res) => {
  const { dispositivo_id, minimo, maximo } = req.body;

  if (!dispositivo_id || minimo === undefined || maximo === undefined) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const updated = await updateConfiguracionAhorroMinAndMax(dispositivo_id, minimo, maximo);
    if (!updated) {
      return res.status(500).json({ error: 'No se pudo actualizar la configuración' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar min/max:', error);
    return res.status(500).json({ error: 'Error interno al actualizar' });
  }
};
