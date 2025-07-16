const express = require('express');
const router = express.Router();
const db = require('../db/database');
const enviarCorreo = require('../services/emailService');

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

// PUT /api/orders/:id/status → actualiza estado y manda correo
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, tracking_url } = req.body;

  const updateSQL = `
    UPDATE orders SET status = ?, tracking_url = ? WHERE id = ?
  `;

  db.run(updateSQL, [status, tracking_url || null, id], function (err) {
    if (err) {
      console.error('❌ Error al actualizar estado del pedido:', err);
      return res.status(500).json({ error: 'Error al actualizar el pedido' });
    }

    db.get(`SELECT email FROM orders WHERE id = ?`, [id], async (err, row) => {
      if (err || !row) {
        console.error('❌ Error al obtener email del pedido:', err);
        return res.status(500).json({ error: 'No se pudo obtener el email del pedido' });
      }

      let subject, html;
      if (status === 'Aceptado') {
        subject = '✅ Tu pedido ha sido aceptado';
        html = `<p>Gracias por tu compra. Tu pedido ha sido aceptado y será enviado pronto.</p>
                ${tracking_url ? `<p><strong>Seguimiento:</strong> <a href="${tracking_url}">${tracking_url}</a></p>` : ''}`;
      } else if (status === 'Cancelado') {
        subject = '❌ Tu pedido fue cancelado';
        html = `<p>Lamentamos informarte que tu pedido fue cancelado. Si tienes dudas, contáctanos.</p>`;
      } else {
        return res.json({ message: 'Estado actualizado, pero no se mandó correo (estado no relevante)' });
      }

      await enviarCorreo(row.email, subject, html);
      res.json({ message: '✅ Estado actualizado y correo enviado' });
    });
  });
});

module.exports = router;
