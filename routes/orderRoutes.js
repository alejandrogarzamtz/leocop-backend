const express = require('express');
const router = express.Router();
const db = require('../db/database'); // ← correcto con tu archivo

// GUARDAR PEDIDO
router.post('/guardar_pedido', (req, res) => {
  const { cart, userData, status } = req.body;

  const {
    email,
    phone,
    address,
    city,
    state,
    zip,
    country = 'México',
  } = userData;

  const insertOrderSQL = `
    INSERT INTO orders (
      customer_name, email, phone, address, city, state, postal_code,
      country, status, tracking_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    insertOrderSQL,
    [
      'Cliente Web', // puedes agregar nombre si luego lo pides
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      status || 'Pendiente',
      null // tracking_url
    ],
    function (err) {
      if (err) {
        console.error('❌ Error al insertar pedido:', err);
        return res.status(500).json({ error: 'Error al guardar el pedido' });
      }

      const orderId = this.lastID;

      const insertItemSQL = `
        INSERT INTO order_items (
          order_id, product_name, product_image, product_price, size, quantity
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const stmt = db.prepare(insertItemSQL);

      cart.forEach((item) => {
        stmt.run([
          orderId,
          item.name,
          item.image,
          item.price,
          item.selectedSize,
          item.quantity
        ]);
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('❌ Error al insertar items:', err);
          return res.status(500).json({ error: 'Error al guardar productos del pedido' });
        }

        res.json({ message: '✅ Pedido guardado con éxito', orderId });
      });
    }
  );
});

// OBTENER TODOS LOS PEDIDOS
router.get('/', (req, res) => {
  const ordersQuery = `SELECT * FROM orders ORDER BY created_at DESC`;
  const itemsQuery = `SELECT * FROM order_items`;

  db.all(ordersQuery, (err, orders) => {
    if (err) {
      console.error('❌ Error al obtener pedidos:', err);
      return res.status(500).json({ error: 'Error al obtener pedidos' });
    }

    db.all(itemsQuery, (err, items) => {
      if (err) {
        console.error('❌ Error al obtener productos de pedidos:', err);
        return res.status(500).json({ error: 'Error al obtener items' });
      }

      // Agrupar items por order_id
      const ordersWithItems = orders.map(order => {
        const orderItems = items.filter(i => i.order_id === order.id);
        return { ...order, items: orderItems };
      });

      res.json(ordersWithItems);
    });
  });
});

module.exports = router;
