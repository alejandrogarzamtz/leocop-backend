const nodemailer = require('nodemailer');
require('dotenv').config();

const nodemailer = require('nodemailer');

// Correo oficial y contraseña de aplicación (NO uses tu contraseña personal)
const EMAIL_USER = 'leocopservice@gmail.com';
const EMAIL_PASS = 'unrmxkcqipijteiy; // reemplaza esto

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const enviarCorreo = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Leocop" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('📨 Correo enviado con éxito a', to);
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
  }
};

// 👉 Enviar prueba
enviarCorreo(
  'destinatario@ejemplo.com', // reemplaza con el tuyo
  'Correo de prueba de Leocop ✅',
  '<h2>¡Todo bien!</h2><p>Este es un correo de prueba enviado desde tu backend.</p>'
);


module.exports = enviarCorreo;
