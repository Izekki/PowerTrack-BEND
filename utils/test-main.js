// test-mail.js
import { sendMail } from './utils/mailService.js';

sendMail({
  to: 'tucorreo@algo.com',
  subject: 'Prueba desde PowerTrack',
  html: '<h1>¡Hola!</h1><p>Esto es una prueba de envío de correo.</p>'
}).then(() => {
  console.log('Correo enviado correctamente');
}).catch(err => {
  console.error('Error:', err);
});
