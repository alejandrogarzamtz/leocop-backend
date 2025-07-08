// backend/db/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../products.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error al conectar con la base de datos', err);
  else console.log('✅ Conectado a SQLite');
});

db.serialize(() => {
  // Crear tabla de productos
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT,
      price REAL NOT NULL,
      category TEXT,
      size TEXT,         -- se guarda como JSON string
      description TEXT
    )
  `);

  // Insertar productos de prueba si la tabla está vacía
  db.get('SELECT COUNT(*) AS count FROM products', (err, row) => {
    if (row.count === 0) {
      const sampleProducts = [
        {
          name: 'Prueba 1',
          image: 'sample1.png',
          price: 19.99,
          category: 'camisetas',
          size: JSON.stringify(['S', 'M', 'L']),
          description: 'Roja con actitud callejera'
        },
        {
          name: 'Prueba2',
          image: 'sample2.png',
          price: 14.99,
          category: 'gorras',
          size: JSON.stringify(['Unitalla']),
          description: 'Oscura, sobria y directa'
        }
      ];

      const insertStmt = db.prepare(`
        INSERT INTO products (name, image, price, category, size, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleProducts.forEach(p => {
        insertStmt.run(p.name, p.image, p.price, p.category, p.size, p.description);
      });

      insertStmt.finalize();
      console.log('🧪 Productos de prueba insertados');
    }
  });

  // Crear tabla de pedidos
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT,
      status TEXT DEFAULT 'Pendiente',
      tracking_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crear tabla de productos del pedido
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_name TEXT,
      product_image TEXT,
      product_price REAL,
      size TEXT,
      quantity INTEGER,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    )
  `);

  console.log('✅ Tablas de pedidos y productos creadas o verificadas');
});

module.exports = db;
