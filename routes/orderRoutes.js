const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Crear tabla de pedidos si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      country TEXT,
      status TEXT DEFAULT 'pendiente',
      products TEXT, -- JSON.stringify de los productos
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Ruta para crear un pedido después de pago exitoso
router.post('/create', (req, res) => {
  const {
    full_name,
    email,
    phone,
    address,
    city,
    postal_code,
    country,
    products // Array de objetos: [{id, name, size, quantity, price}]
  } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ error: 'No hay productos en el pedido.' });
  }

  const productsString = JSON.stringify(products);
  const fullAddress = `${address}, ${city}, ${postal_code}, ${country}`;

  const stmt = `
    INSERT INTO orders (full_name, email, phone, address, city, postal_code, country, products)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    stmt,
    [full_name, email, phone, address, city, postal_code, country, productsString],
    function (err) {
      if (err) {
        console.error('❌ Error al insertar pedido:', err);
        return res.status(500).json({ error: 'Error al guardar el pedido.' });
      }

      res.status(201).json({ success: true, order_id: this.lastID });
    }
  );
});

module.exports = router;
