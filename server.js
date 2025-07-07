const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes estáticas desde /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api/products', productRoutes);

// Arrancar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en http://127.0.0.1:${PORT}`);
});
