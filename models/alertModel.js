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
  static async obtenerPorUsuario(usuarioId) {
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
      `;
      const [rows] = await db.execute(query, [usuarioId]);
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

  /**
   * Crea una alerta manual o automática.
   *
   * @param {Object} params
   * @param {number|null} params.usuarioId       — ID de usuario (puede ser null si es alerta de sensor)
   * @param {string}      params.mensaje         — Texto de la alerta
   * @param {string}      params.nivel           — 'Bajo' | 'Medio' | 'Alto'
   * @param {number|null} params.idTipoDispositivo — FK a tipos_dispositivos
   * @param {number|null} params.sensorId        — FK a sensor, para alertas de consumo
   * @param {number|null} params.tipoAlertaId    — FK a tipos_alerta
   */
  static async crear({
    usuarioId = null,
    mensaje,
    nivel,
    idTipoDispositivo = null,
    sensorId = null,
    tipoAlertaId = null
  }) {
    try {
      const query = `
        INSERT INTO alertas (
          usuario_id,
          sensor_id,
          mensaje,
          nivel,
          id_tipo_dispositivo,
          tipo_alerta_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute(query, [
        usuarioId,
        sensorId,
        mensaje,
        nivel,
        idTipoDispositivo,
        tipoAlertaId
      ]);
      return {
        id: result.insertId,
        usuarioId,
        sensorId,
        mensaje,
        nivel,
        idTipoDispositivo,
        tipoAlertaId
      };
    } catch (err) {
      throw new Error(`Error al crear alerta: ${err.message}`);
    }
  }
}

export default AlertModel;
