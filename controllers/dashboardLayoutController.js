import { db } from '../db/connection.js';

export const dashboardLayoutController = {
  getLayout: async (req, res) => {
    const { userId } = req.params;

    try {
      const [rows] = await db.query(
        'SELECT layout_json FROM dashboard_layouts WHERE usuario_id = ?',
        [userId]
      );

      if (rows.length > 0) {
        return res.json({ layout: rows[0].layout_json });
      } else {
        // Si no tiene configuración, devolvemos null o un default
        // El frontend se encargará de poner el layout por defecto
        return res.json({ layout: null });
      }
    } catch (error) {
      console.error('Error obteniendo layout:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  // Guardar o Actualizar la configuración
  saveLayout: async (req, res) => {
    const { userId } = req.params;
    const { layout } = req.body; // Esperamos { layout: ["id1", "id2"] }

    if (!layout || !Array.isArray(layout)) {
      return res.status(400).json({ message: 'Formato de layout inválido' });
    }

    try {
      // Convertimos el array a string JSON para guardarlo
      const layoutString = JSON.stringify(layout);

      // Usamos ON DUPLICATE KEY UPDATE para insertar o actualizar en una sola consulta
      await db.query(
        `INSERT INTO dashboard_layouts (usuario_id, layout_json) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE layout_json = VALUES(layout_json)`,
        [userId, layoutString]
      );

      res.json({ message: 'Configuración guardada exitosamente' });
    } catch (error) {
      console.error('Error guardando layout:', error);
      res.status(500).json({ message: 'Error al guardar la configuración' });
    }
  }
};