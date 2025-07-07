// backend/db/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../products.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error al conectar con la base de datos', err);
  else console.log('Conectado a SQLite');
});

// Crear tabla si no existe
db.serialize(() => {
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

  // Insertar datos de prueba si la tabla está vacía
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
      console.log('Productos de prueba insertados');
    }
  });
});

module.exports = db;
