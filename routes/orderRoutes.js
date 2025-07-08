const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Ruta para crear un nuevo pedido
router.post('/create', (req, res) => {
  const {
    customer_name,
    email,
    phone,
    address,
    city,
    state,
    postal_code,
    country,
    cartItems
  } = req.body;

  // Insertar pedido en tabla orders
  const insertOrder = `
    INSERT INTO orders (
      customer_name, email, phone, address, city, state, postal_code, country
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(insertOrder, [customer_name, email, phone, address, city, state, postal_code, country], function (err) {
    if (err) {
      console.error('❌ Error al insertar pedido:', err);
      return res.status(500).json({ error: 'Error al crear el pedido' });
    }

    const orderId = this.lastID;

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_name, product_image, product_price, size, quantity
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    cartItems.forEach(item => {
      insertItem.run([
        orderId,
        item.name,
        item.image,
        item.price,
        item.selectedSize,
        item.quantity
      ]);
    });

    insertItem.finalize();

    res.status(200).json({ message: 'Pedido creado exitosamente', orderId });
  });
});

module.exports = router;
