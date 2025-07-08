// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { MercadoPagoConfig, Payment } = require('mercadopago'); // 👈 SDK v3+

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Mercado Pago setup con nueva forma
const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_TOKEN });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para procesar pagos
app.post('/api/pago', async (req, res) => {
  const { token, amount, description, email } = req.body;

  try {
    const pago = await new Payment(mp).create({
      transaction_amount: Number(amount),
      token,
      description,
      installments: 1,
      payer: { email }
    });

    res.json(pago);
  } catch (err) {
    console.error('❌ Error al procesar el pago:', err);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://127.0.0.1:${PORT}`);
});


