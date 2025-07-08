// backend/server.js o app.js
require('dotenv').config(); // 👈 Cargar variables de entorno

const express = require('express');
const cors = require('cors');
const path = require('path');
const mercadopago = require('mercadopago'); // 👈 Agregado
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar Mercado Pago con la clave secreta
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_TOKEN // 👈 No pongas el token directo
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

// Rutas API existentes
app.use('/api/products', productRoutes);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://127.0.0.1:${PORT}`);
});
