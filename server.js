// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const stripe = Stripe('sk_test_51RihgYC01ph3qasLve9SSiolMcnJ15yG4SXB12BUfctdqoUk7iRBj02dWw9flaFgi6B8cjL74DQokeBA0DJpXclP00aIgwz5wg');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar transportador de correos
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'leocopstore@gmail.com',
    pass: 'unrmxkcqipijteiy', // asegúrate de activar "less secure apps" o usar App Passwords si tienes 2FA
  },
});

// Enviar correo de confirmación de pago
const enviarCorreoPagoExitoso = async (email, amount) => {
  const html = `
    <h2>✅ ¡Pago recibido con éxito!</h2>
    <p>Gracias por tu compra. Recibimos tu pago de <strong>$${amount.toFixed(2)} MXN</strong>.</p>
    <p>En unos momentos recibirás otro correo confirmando el envío de tu pedido junto con la guía de rastreo.</p>
    <br>
    <p>Atentamente,<br>Equipo Leocop</p>
  `;

  try {
    await transporter.sendMail({
      from: '"Leocop" <leocopstore@gmail.com>',
      to: email,
      subject: '✅ Pago recibido con éxito - Leocop',
      html,
    });
    console.log('📨 Correo de pago exitoso enviado a', email);
  } catch (error) {
    console.error('❌ Error al enviar correo de pago exitoso:', error);
  }
};

// Ruta de pago
app.post('/api/pago', async (req, res) => {
  const { amount, description, email } = req.body;

  console.log('📩 Petición recibida para crear pago:', { amount, description, email });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'mxn',
      description,
      receipt_email: email
    });

    console.log('✅ PaymentIntent creado con éxito:', paymentIntent.id);

    // Enviar correo después de crear el PaymentIntent (se asume que siempre se acepta porque es modo test)
    await enviarCorreoPagoExitoso(email, amount);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('❌ Error al crear PaymentIntent:', err.message);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

// Rutas API
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
});

