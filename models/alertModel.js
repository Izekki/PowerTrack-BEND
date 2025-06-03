import { db } from '../db/connection.js';

class AlertModel {
  // Genera alertas por defecto según el tipo de dispositivo
  static async generarPorTipoDispositivo(usuarioId, tipoDispositivoId) {
    try {
      const [tipos] = await db.execute(
        `SELECT nombre, consumo_minimo_w, consumo_maximo_w
         FROM tipos_dispositivos WHERE id = ?`,
        [tipoDispositivoId]
      );
      const tipo = tipos[0];
      if (!tipo) throw new Error('Tipo de dispositivo no encontrado.');

      const alertas = this.generarAlertasDefault(tipo);
      for (const alerta of alertas) {
        await this.crear({ usuarioId, mensaje: alerta.mensaje, nivel: alerta.nivel, idTipoDispositivo: tipoDispositivoId });
      }
      return alertas;
    } catch (err) {
      throw new Error(`Error al generar alertas por tipo: ${err.message}`);
    }
  }

  // Arma la lista de alertas predeterminadas para un tipo de dispositivo
  static generarAlertasDefault(tipoDispositivo) {
    const { nombre, consumo_minimo_w, consumo_maximo_w } = tipoDispositivo;
    const alertas = [];

    if (consumo_maximo_w) {
      alertas.push({ mensaje: `${nombre}: Consumo superior a ${consumo_maximo_w}W detectado`, nivel: 'Alto' });
    }
    if (consumo_minimo_w) {
      alertas.push({ mensaje: `${nombre}: Consumo inferior a ${consumo_minimo_w}W detectado`, nivel: 'Medio' });
    }
    switch (nombre.toLowerCase()) {
      case 'refrigerador':
        alertas.push({ mensaje: `${nombre}: Posible falla en sistema de refrigeración`, nivel: 'Alto' });
        break;
      case 'aire acondicionado':
        alertas.push({ mensaje: `${nombre}: Eficiencia energética reducida`, nivel: 'Medio' });
        break;
      case 'calentador':
      case 'calefactor':
        alertas.push({ mensaje: `${nombre}: Tiempo de operación excesivo`, nivel: 'Medio' });
        break;
      default:
        alertas.push({ mensaje: `${nombre}: Patrón de consumo irregular detectado`, nivel: 'Bajo' });
    }
    return alertas;
  }

  // Recupera todas las alertas de un usuario, con info de dispositivo y tipo de alerta
  static async obtenerPorUsuario(usuarioId, offset = 0, limit = 10) {
    try {
      const query = `
      SELECT
        a.id,
        a.mensaje,
        a.nivel,
        a.fecha,
        td.nombre AS tipo_dispositivo,
        ta.clave    AS tipo_alerta_clave,
        ta.nombre   AS tipo_alerta_nombre,
        ta.icono_svg
      FROM alertas a
      LEFT JOIN tipos_dispositivos td ON a.id_tipo_dispositivo = td.id
      LEFT JOIN tipos_alerta     ta ON a.tipo_alerta_id     = ta.id
      WHERE a.usuario_id = ?
      ORDER BY a.fecha DESC
      LIMIT ? OFFSET ?
    `;
      const [rows] = await db.execute(query, [usuarioId, Number(limit), Number(offset)]);
      return rows;
    } catch (err) {
      throw new Error(`Error al obtener alertas: ${err.message}`);
    }
  }

  // Elimina una alerta si pertenece al usuario
  static async eliminar(id, usuarioId) {
    try {
      const [res] = await db.execute(
        `DELETE FROM alertas WHERE id = ? AND usuario_id = ?`,
        [id, usuarioId]
      );
      return res.affectedRows > 0;
    } catch (err) {
      throw new Error(`Error al eliminar alerta: ${err.message}`);
    }
  }


  
static async verificarAlertasPorConsumo(sensorId, potencia) {
  try {
    // 1. Obtener información del dispositivo
    const [dispRows] = await db.execute(
      `SELECT d.id AS dispositivoId, d.usuario_id AS usuarioId, d.id_tipo_dispositivo 
       FROM dispositivos d
       WHERE d.id_sensor = ?
       LIMIT 1`,
      [sensorId]
    );

    if (!dispRows.length) return;

    const dispositivo = dispRows[0];
    const { usuarioId, dispositivoId, id_tipo_dispositivo } = dispositivo;

    // 2. Obtener configuración de ahorro
    const [configRows] = await db.execute(
      `SELECT 
          COALESCE(minimo, 47) AS minimo, 
          COALESCE(maximo, 300) AS maximo,
          COALESCE(clave_alerta, 'consumo') AS clave_alerta, 
          mensaje
       FROM configuracion_ahorro
       WHERE dispositivo_id = ?
       LIMIT 1`,
      [dispositivoId]
    );

    const config = configRows[0] || { minimo: 47, maximo: 300 };

    // 3. Umbrales en W
    const umbralMinimo_W = config.minimo;
    const umbralMaximo_W = config.maximo;

    // 4. Tipo de alerta
    const tipoAlertaClave = config.clave_alerta || 'consumo';
    const tipoAlertaId = await this.obtenerIdTipoAlerta(tipoAlertaClave);

    // 5. Alerta por consumo excesivo (en W)
    if (potencia > umbralMaximo_W) {
      await this.crear({
        usuarioId,
        mensaje: config.mensaje || `Potencia excesiva: ${potencia} W (supera el máximo de ${umbralMaximo_W} W)`,
        nivel: 'Alto',
        idTipoDispositivo: id_tipo_dispositivo,
        dispositivoId,
        tipoAlertaId
      });
    }

    // 6. Alerta por bajo consumo (opcional)
    else if (potencia < umbralMinimo_W) {
      await this.crear({
        usuarioId,
        mensaje: config.mensaje || `Baja potencia: ${potencia} W (por debajo del mínimo de ${umbralMinimo_W} W)`,
        nivel: 'Bajo',
        idTipoDispositivo: id_tipo_dispositivo,
        dispositivoId,
        tipoAlertaId
      });
    }

  } catch (error) {
    console.error('Error en verificarAlertasPorConsumo:', error.message);
  }
}

// Helper para obtener ID de tipo de alerta
static async obtenerIdTipoAlerta(clave) {
  const [tipos] = await db.execute(
    `SELECT id FROM tipos_alerta WHERE clave = ? LIMIT 1`,
    [clave]
  );
  return tipos[0]?.id || null;
}

  /**
   * Crea una alerta manual o automática.
   *
   * @param {Object} params
   * @param {number|null} params.usuarioId       — ID de usuario (puede ser null si es alerta de sensor)
   * @param {string}      params.mensaje         — Texto de la alerta
   * @param {string}      params.nivel           — 'Bajo' | 'Medio' | 'Alto'
   * @param {number|null} params.idTipoDispositivo — FK a tipos_dispositivos
   * @param {number|null} params.dispositivoId   — FK a sensor, para alertas de consumo
   * @param {number|null} params.tipoAlertaId    — FK a tipos_alerta
   */
  static async crear({
    usuarioId = null,
    mensaje,
    nivel,
    idTipoDispositivo = null,
    tipoAlertaId = null,
    dispositivoId = null
  }) {
    try {
      const query = `
        INSERT INTO alertas (
          usuario_id,
          mensaje,
          nivel,
          id_tipo_dispositivo,
          tipo_alerta_id,
          dispositivo_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute(query, [
        usuarioId,
        mensaje,
        nivel,
        idTipoDispositivo,
        tipoAlertaId,
        dispositivoId
      ]);
      return {
        id: result.insertId,
        usuarioId,
        mensaje,
        nivel,
        idTipoDispositivo,
        tipoAlertaId,
        dispositivoId
      };
    } catch (err) {
      throw new Error(`Error al crear alerta: ${err.message}`);
    }
  }
}

export default AlertModel;
