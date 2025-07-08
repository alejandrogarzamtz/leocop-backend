// backend/server.js
require('dotenv').config(); // 👈 Cargar variables de entorno

const express = require('express');
const cors = require('cors');
const path = require('path');
const mercadopago = require('mercadopago');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes'); // 👈 Nuevo

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_TOKEN
});

// Ruta para procesar pagos
app.post('/api/pago', async (req, res) => {
  const { token, amount, description, email } = req.body;

  try {
    const pago = await mercadopago.payment.create({
      transaction_amount: Number(amount),
      token,
      description,
      installments: 1,
      payer: { email }
    });

    res.json(pago.body);
  } catch (err) {
    console.error('❌ Error al procesar el pago:', err);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); // 👈 Nueva ruta para pedidos

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://127.0.0.1:${PORT}`);
});

