const nodemailer = require('nodemailer');

// Correo oficial de Leocop y contraseña de aplicación (NO es la contraseña personal)
const EMAIL_USER = 'leocopservice@gmail.com';
const EMAIL_PASS = 'unrmxkcqipijteiy'; // ✅ sin espacios, tal cual

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Función para enviar correos
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

module.exports = enviarCorreo;

