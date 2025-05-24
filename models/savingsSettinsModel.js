import {db} from '../db/connection.js';

export const insertConfiguracionAhorro = async (usuario_id, dispositivo_id, minimo, maximo, clave_alerta, mensaje) => {
  return await db.execute(
    `INSERT INTO configuracion_ahorro (usuario_id, dispositivo_id, minimo, maximo, clave_alerta, mensaje)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id, dispositivo_id, minimo, maximo, clave_alerta, mensaje]
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
