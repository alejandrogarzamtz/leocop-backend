const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/orders/guardar_pedido
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
      'Cliente Web',
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      status || 'Pendiente',
      null
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

// GET /api/orders → devuelve todos los pedidos con sus items
router.get('/', (req, res) => {
  const ordersQuery = `SELECT * FROM orders ORDER BY created_at DESC`;
  db.all(ordersQuery, [], (err, orders) => {
    if (err) {
      console.error('❌ Error al obtener pedidos:', err);
      return res.status(500).json({ error: 'Error al cargar pedidos' });
    }

    const getOrderItems = (orderId) => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM order_items WHERE order_id = ?`,
          [orderId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
    };

    Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(order.id);
        const total = items.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
        return {
          id: order.id,
          status: order.status,
          createdAt: order.created_at,
          userData: {
            name: order.customer_name,
            email: order.email,
            phone: order.phone,
            address: order.address,
            city: order.city,
            state: order.state,
            zip: order.postal_code,
            country: order.country,
          },
          cart: items,
          total: total.toFixed(2),
        };
      })
    )
      .then((fullOrders) => res.json(fullOrders))
      .catch((err) => {
        console.error('❌ Error al obtener productos por pedido:', err);
        res.status(500).json({ error: 'Error al unir productos con pedidos' });
      });
  });
});

module.exports = router;
