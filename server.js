// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const Stripe = require('stripe');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CLAVE STRIPE directamente (solo para pruebas)
const stripe = Stripe('sk_test_51RihgYC01ph3qasLve9SSiolMcnJ15yG4SXB12BUfctdqoUk7iRBj02dWw9flaFgi6B8cjL74DQokeBA0DJpXclP00aIgwz5wg');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

