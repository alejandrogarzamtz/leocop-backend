// routes/productRoutes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log('📢 Ruta /api/products fue llamada');
  res.json([
    {
      id: 1,
      name: 'Producto de prueba',
      price: 19.99,
      image: 'imagen1.jpg',
      category: 'camisetas',
      size: ['S', 'M', 'L'],
      description: 'Este es un producto de prueba'
    }
  ]);
});

module.exports = router;
