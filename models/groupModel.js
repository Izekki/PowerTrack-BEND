import {db} from '../db/connection.js';

export const createGroup = async (name) => {
    try {
        const [result] = await db.query(
            'INSERT INTO grupos (nombre) VALUES (?); ',
            [name]
        );
        return {i: result.insertId}
    } catch (error) { 
        throw new Error('Error al crear grupo' + error.message);
        
    }
}