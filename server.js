require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const Stripe = require('stripe');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Verifica si la key está cargada
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ No se encontró STRIPE_SECRET_KEY en el archivo .env');
  process.exit(1);
}

// Stripe setup
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para procesar pagos
app.post('/api/pago', async (req, res) => {
  const { amount, description, email } = req.body;
  console.log('📩 Petición recibida para crear pago:', { amount, description, email });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // ⚠️ Centavos
      currency: 'mxn',
      description,
      receipt_email: email
    });

    console.log('✅ PaymentIntent creado con éxito:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('❌ Error al crear PaymentIntent:', err);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

// Rutas API
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://127.0.0.1:${PORT}`);
});

