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


  
static async verificarAlertasPorConsumo(sensorId, consumoMedicionKWh) {
  try {
    // 1. Obtener información del dispositivo
    const [dispRows] = await db.execute(
      `SELECT d.id AS dispositivoId, d.usuario_id AS usuarioId, 
              d.id_tipo_dispositivo AS idTipoDispositivo
       FROM dispositivos d
       WHERE d.id_sensor = ?
       LIMIT 1`,
      [sensorId]
    );
    
    if (!dispRows.length) return;
    
    const dispositivo = dispRows[0];
    const { usuarioId, idTipoDispositivo, dispositivoId } = dispositivo;

    // 2. Obtener configuración de ahorro (con valores por defecto)
    const [configRows] = await db.execute(
      `SELECT 
          COALESCE(minimo, 0.05) AS minimo, 
          COALESCE(maximo, 0.83) AS maximo, 
          COALESCE(clave_alerta, 'Consumo') AS clave_alerta, 
          mensaje
       FROM configuracion_ahorro
       WHERE (usuario_id = ? OR usuario_id IS NULL)
         AND (dispositivo_id = ? OR dispositivo_id IS NULL)
       ORDER BY usuario_id DESC, dispositivo_id DESC
       LIMIT 1`,
      [usuarioId, dispositivoId]
    );

    const config = configRows[0] || { minimo: 0.05, maximo: 0.83 };

    // 3. Verificar si ya existe alerta hoy
    const existeHoy = async (tipoAlertaClave) => {
      const [r] = await db.execute(
        `SELECT 1 FROM alertas a
         JOIN tipos_alerta ta ON a.tipo_alerta_id = ta.id
         WHERE a.sensor_id = ? 
           AND ta.clave = ?
           AND DATE(a.fecha) = CURDATE()
         LIMIT 1`,
        [sensorId, tipoAlertaClave]
      );
      return r.length > 0;
    };

    // 4. Verificar y crear alertas
    const tipoAlertaClave = config.clave_alerta || 'Consumo';
    
    // Alerta por consumo excesivo
    if (consumoMedicionKWh > config.maximo) {
      if (!(await existeHoy(tipoAlertaClave))) {
        await this.crear({
          usuarioId,
          mensaje: config.mensaje || `Consumo excesivo: ${consumoMedicionKWh.toFixed(2)} kWh (supera el máximo de ${config.maximo} kWh)`,
          nivel: 'Alto',
          idTipoDispositivo,
          sensorId,
          tipoAlertaId: await this.obtenerIdTipoAlerta(tipoAlertaClave)
        });
      }
    }
    // Alerta por consumo bajo (opcional)
    else if (consumoMedicionKWh < config.minimo) {
      if (!(await existeHoy(tipoAlertaClave))) {
        await this.crear({
          usuarioId,
          mensaje: config.mensaje || `Consumo muy bajo: ${consumoMedicionKWh.toFixed(2)} kWh (por debajo del mínimo de ${config.minimo} kWh)`,
          nivel: 'Bajo',
          idTipoDispositivo,
          sensorId,
          tipoAlertaId: await this.obtenerIdTipoAlerta(tipoAlertaClave)
        });
      }
    }
  } catch (error) {
    console.error('Error en verificarAlertasPorConsumo:', error);
    // No relanzamos el error para no afectar el flujo principal
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
