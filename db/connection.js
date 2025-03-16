import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
    
});

export const connectDB = async () => {
    try {
        const connection = await db.getConnection();
        console.log('Conexion exitosa con la base de datos');
        connection.release();
    } catch (error) {
        console.error('Error en la conexion con la base de datos', error);
    }
    
}