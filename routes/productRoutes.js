const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Producto de prueba',
      image: 'sample.jpg',
      price: 19.99,
      category: 'camisetas',
      size: ['S', 'M', 'L'],
      description: 'Este es un producto de prueba'
    }
  ]);
});

module.exports = router;
