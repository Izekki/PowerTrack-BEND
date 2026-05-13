import { sendMail } from '../utils/mailService.js';

const SUPPORT_EMAIL = process.env.CONTACT_SUPPORT_EMAIL || 'powertrack2025@gmail.com';

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildContactEmail = ({ fullName, email, subject, message }) => {
  const receivedAt = new Date().toISOString();
  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

  return {
    to: SUPPORT_EMAIL,
    subject: `[Contacto PowerTrack] ${subject}`,
    text:
      `Nuevo mensaje de contacto\n\n` +
      `Nombre: ${fullName}\n` +
      `Correo: ${email}\n` +
      `Asunto: ${subject}\n` +
      `Fecha de recepcion: ${receivedAt}\n\n` +
      `Mensaje:\n${message}`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${safeName}</p>
      <p><strong>Correo:</strong> ${safeEmail}</p>
      <p><strong>Asunto:</strong> ${safeSubject}</p>
      <p><strong>Fecha de recepcion:</strong> ${receivedAt}</p>
      <hr />
      <p><strong>Mensaje:</strong></p>
      <p>${safeMessage}</p>
    `,
    replyTo: email
  };
};

export const sendContactMessage = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    await sendMail(buildContactEmail({ fullName, email, subject, message }));

    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente'
    });
  } catch (error) {
    console.error('Error en endpoint de contacto:', error.message);

    return res.status(500).json({
      success: false,
      message: 'No fue posible enviar el mensaje'
    });
  }
};
