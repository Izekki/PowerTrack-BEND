import AlertModel from '../models/alertModel.js';

class AlertaController {
  // 🔹 Obtener todas las alertas de un usuario
  static async obtenerPorUsuario(req, res) {
  try {
    const { usuarioId } = req.params;
    const authenticatedUserId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const filtro = req.query.filtro || 'todos';

    // 🔒 Validar que el usuario solo vea sus propias alertas
    if (parseInt(usuarioId) !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permiso para ver alertas de otros usuarios' 
      });
    }

    const alertas = await AlertModel.obtenerPorUsuarioPaginado(usuarioId, limit, offset, filtro);
    res.json({ 
      success: true,
      data: alertas 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
//Marcar alertas como leidas
static async marcarLeidas(req, res) {
  try {
    const { usuarioId } = req.params;
    const authenticatedUserId = req.user.userId;

    // Validar que el usuario solo marque sus propias alertas
    if (parseInt(usuarioId) !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permiso para marcar alertas de otros usuarios' 
      });
    }

    await AlertModel.marcarComoLeidas(usuarioId);
    res.json({ 
      success: true,
      message: 'Alertas marcadas como leídas' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

//verificar alertas no leidas
static async verificarNuevas(req, res) {
  try {
    const { usuarioId } = req.params;
    const authenticatedUserId = req.user.userId;

    // Validar que el usuario solo vea sus propias alertas no leídas
    if (parseInt(usuarioId) !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permiso para verificar alertas de otros usuarios' 
      });
    }

    const hayNuevas = await AlertModel.hayAlertasNoLeidas(usuarioId);
    res.json({ 
      success: true,
      nuevas: hayNuevas 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

//Marcar una sola alerta
static async marcarUnaLeida(req, res) {
  try {
    const { alertaId } = req.params;
    const authenticatedUserId = req.user.userId;

    // Para validar que la alerta pertenece al usuario autenticado,
    // necesitaríamos obtener la alerta y verificar su usuario_id
    // Por ahora, confiamos que el parámetro viene validado desde el router
    // En producción, deberías implementar una consulta a BD primero:
    const alerta = await AlertModel.obtenerPorId(alertaId);
    
    if (!alerta) {
      return res.status(404).json({ 
        success: false,
        error: 'Alerta no encontrada' 
      });
    }

    // Validar que la alerta pertenece al usuario autenticado
    if (alerta.usuario_id !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permiso para marcar esta alerta' 
      });
    }

    await AlertModel.marcarUnaComoLeida(alertaId);
    res.json({ 
      success: true,
      message: 'Alerta marcada como leída' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}



  // 🔹 Crear alertas predeterminadas al registrar un nuevo dispositivo
  static async generarPorTipoDispositivo(req, res) {
    try {
      const { usuarioId, tipoDispositivoId } = req.body;
      const authenticatedUserId = req.user.userId;

      // 🔒 Validar que el usuarioId en el body coincida con el del token
      if (parseInt(usuarioId) !== authenticatedUserId) {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permiso para generar alertas para otros usuarios' 
        });
      }

      const alertas = await AlertModel.generarPorTipoDispositivo(usuarioId, tipoDispositivoId);
      res.status(201).json({ 
        success: true,
        data: alertas 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // 🔹 Crear alerta manual
  static async crear(req, res) {
    try {
      const { usuarioId, mensaje, nivel, tipoDispositivoId } = req.body;
      const authenticatedUserId = req.user.userId;

      // 🔒 Validar que el usuarioId en el body coincida con el del token
      if (parseInt(usuarioId) !== authenticatedUserId) {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permiso para crear alertas para otros usuarios' 
        });
      }

      const nuevaAlerta = await AlertModel.crear(usuarioId, mensaje, nivel, tipoDispositivoId);
      res.status(201).json({ 
        success: true,
        data: nuevaAlerta 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // 🔹 Eliminar alerta
  static async eliminar(req, res) {
    try {
      const { id, usuarioId } = req.params;
      const authenticatedUserId = req.user.userId;

      // Validar que el usuarioId en los params coincida con el del token
      if (parseInt(usuarioId) !== authenticatedUserId) {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permiso para eliminar alertas de otros usuarios' 
        });
      }

      const eliminado = await AlertModel.eliminar(id, usuarioId);
      if (eliminado) {
        res.json({ 
          success: true,
          mensaje: "Alerta eliminada correctamente" 
        });
      } else {
        res.status(404).json({ 
          success: false,
          mensaje: "Alerta no encontrada" 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
}

export default AlertaController;
