import {db} from '../db/connection.js';
export const createGroup = async (name, devices) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [existingGroup] = await connection.query(
            'SELECT * FROM grupos WHERE nombre = ?;',
            [name]
        );
        
        if (existingGroup.length > 0) {
            throw new Error('Ya existe un grupo con ese nombre');
        }

        const [result] = await connection.query(
            'INSERT INTO grupos (nombre) VALUES (?);',
            [name]
        );
        const groupId = result.insertId;

        if (devices.length > 0) {
            const deviceQueries = devices.map(deviceId => {
                return connection.query(
                    'INSERT INTO dispositivos_agrupados (grupo_id, dispositivo_id) VALUES (?, ?);',
                    [groupId, deviceId]
                ).then(() => {
                    return connection.query(
                        'UPDATE dispositivos SET id_grupo = ? WHERE id = ?;',
                        [groupId, deviceId]
                    );
                });
            });
            await Promise.all(deviceQueries);
        }
        await connection.commit();
        return { id: groupId };
    } catch (error) {
        await connection.rollback();
        throw new Error('Error al crear grupo: ' + error.message);
    } finally {
        connection.release();
    }
};
