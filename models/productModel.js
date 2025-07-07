// backend/models/productModel.js
const db = require('../db/database');

const getAllProducts = (callback) => {
  db.all('SELECT * FROM products', [], callback);
};

const getProductById = (id, callback) => {
  db.get('SELECT * FROM products WHERE id = ?', [id], callback);
};

const createProduct = (product, callback) => {
  const { name, image, price, category, size, description } = product;
  db.run(
    `INSERT INTO products (name, image, price, category, size, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, image, price, category, JSON.stringify(size), description],
    function (err) {
      callback(err, { id: this.lastID, ...product });
    }
  );
};

const updateProduct = (id, product, callback) => {
  const { name, image, price, category, size, description } = product;
  db.run(
    `UPDATE products
     SET name = ?, image = ?, price = ?, category = ?, size = ?, description = ?
     WHERE id = ?`,
    [name, image, price, category, JSON.stringify(size), description, id],
    function (err) {
      callback(err, { changes: this.changes });
    }
  );
};

const deleteProduct = (id, callback) => {
  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    callback(err, { changes: this.changes });
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
