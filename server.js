// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // 👈 Configuración de Stripe

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para crear un PaymentIntent
app.post('/api/pago', async (req, res) => {
  const { amount, description, currency = 'mxn' } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount), // en centavos, ej: 100.00 MXN = 10000
      currency,
      description,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('❌ Error al crear el PaymentIntent:', err);
    res.status(500).json({ error: 'Error al procesar el pago con Stripe' });
  }
});

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://127.0.0.1:${PORT}`);
});


