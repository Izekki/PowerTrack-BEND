// utils/mailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar las variables del archivo .env
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendMail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"PowerTrack" <${process.env.EMAIL_USER}>`,
      ...mailOptions
    });

    console.log('Mensaje enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw new Error('Error al enviar correo: ' + error.message);
  }
};
