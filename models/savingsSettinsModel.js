import {db} from '../db/connection.js';

export const insertConfiguracionAhorro = async (usuario_id, dispositivo_id, minimo, maximo, clave_alerta, mensaje, connection = db) => {
  return await connection.execute(
    `INSERT INTO configuracion_ahorro (usuario_id, dispositivo_id, minimo, maximo, clave_alerta, mensaje)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id, dispositivo_id, minimo, maximo, clave_alerta, mensaje ?? null]
  );
};

export const fetchConfiguracionByDevice = async (dispositivo_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM configuracion_ahorro WHERE dispositivo_id = ?`,
    [dispositivo_id]
  );
  return rows;
};

export const updateConfiguracionByDevice = async (dispositivo_id, minimo, maximo, clave_alerta, mensaje) => {
  return await db.execute(
    `UPDATE configuracion_ahorro SET minimo = ?, maximo = ?, clave_alerta = ?, mensaje = ? WHERE dispositivo_id = ?`,
    [minimo, maximo, clave_alerta, mensaje, dispositivo_id]
  );
};

export const updateConfiguracionAhorroMinAndMax = async (dispositivo_id, minimo, maximo) => {
  const [result] = await db.query(
    `UPDATE configuracion_ahorro 
     SET minimo = ?, maximo = ? 
     WHERE dispositivo_id = ?`,
    [minimo, maximo, dispositivo_id]
  );
  return result.affectedRows > 0;
};


export const getConfiguracionesPorUsuario = async (usuario_id) => {
  const [rows] = await db.query(
          `SELECT 
        c.id AS configuracion_id,
        c.dispositivo_id,
        d.nombre AS dispositivo_nombre,
        d.ubicacion AS dispositivo_ubicacion,
        t.nombre AS tipo_dispositivo,
        c.minimo,
        c.maximo,
        t.consumo_minimo_w,
        t.consumo_maximo_w,
        c.clave_alerta,
        c.mensaje
      FROM configuracion_ahorro c
      INNER JOIN dispositivos d ON c.dispositivo_id = d.id
      INNER JOIN tipos_dispositivos t ON d.id_tipo_dispositivo = t.id
      WHERE d.usuario_id = ?`,
    [usuario_id]
  );

  return rows;
};