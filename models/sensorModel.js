import {db} from '../db/connection.js';

export const getAllSensors = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM sensores')
        return rows;
    } catch (error) {
        throw new Error('Error al obtener sensores');
    }
}

export const findSensorById = async (sensorId) => {
    try {
        const [rows] = await db.query('SELECT * FROM sensores WHERE id = ?', [sensorId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw new Error('Error al obtener el sensor por ID');
    }

}