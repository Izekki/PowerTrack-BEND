import AlertModel from '../models/alertModel.js';

class AlertaController {
  // 🔹 Obtener todas las alertas de un usuario
  static async obtenerPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const alertas = await AlertModel.obtenerPorUsuario(usuarioId);
      res.json(alertas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🔹 Crear alertas predeterminadas al registrar un nuevo dispositivo
  static async generarPorTipoDispositivo(req, res) {
    try {
      const { usuarioId, tipoDispositivoId } = req.body;
      const alertas = await AlertModel.generarPorTipoDispositivo(usuarioId, tipoDispositivoId);
      res.status(201).json(alertas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🔹 Crear alerta manual
  static async crear(req, res) {
    try {
      const { usuarioId, mensaje, nivel, tipoDispositivoId } = req.body;
      const nuevaAlerta = await AlertModel.crear(usuarioId, mensaje, nivel, tipoDispositivoId);
      res.status(201).json(nuevaAlerta);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🔹 Eliminar alerta
  static async eliminar(req, res) {
    try {
      const { id, usuarioId } = req.params;
      const eliminado = await AlertModel.eliminar(id, usuarioId);
      if (eliminado) {
        res.json({ mensaje: 'Alerta eliminada correctamente' });
      } else {
        res.status(404).json({ mensaje: 'Alerta no encontrada' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default AlertaController;
