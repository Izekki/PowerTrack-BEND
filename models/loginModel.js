import { db } from '../db/connection.js';
import bcrypt from 'bcrypt'

export const getUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [email]);
  return rows[0];
};

export const validatePassword = async (password, storedPassword) => {
    let valid = false;
    try{
      valid = await bcrypt.compareSync(password, storedPassword);
    }catch(e){
      console.log(e);
    }
  
    return valid;
};
