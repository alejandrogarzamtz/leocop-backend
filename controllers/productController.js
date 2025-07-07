// backend/controllers/productController.js
const path = require('path');
const fs = require('fs');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../models/productModel');

// GET todos los productos
const getProducts = (req, res) => {
  getAllProducts((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // parsear el campo "size" de string a array
    const products = rows.map(p => ({ ...p, size: JSON.parse(p.size) }));
    res.json(products);
  });
};

// GET producto por ID
const getProduct = (req, res) => {
  const id = req.params.id;
  getProductById(id, (err, product) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    product.size = JSON.parse(product.size);
    res.json(product);
  });
};

// POST nuevo producto con imagen
const createProductHandler = (req, res) => {
  const { name, price, category, size, description } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price || !category || !description || !size || !image) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const product = {
    name,
    price: parseFloat(price),
    category,
    size: JSON.parse(size),
    description,
    image
  };

  createProduct(product, (err, newProduct) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(newProduct);
  });
};

// PUT actualizar producto
const updateProductHandler = (req, res) => {
  const id = req.params.id;
  const { name, price, category, size, description } = req.body;
  const image = req.file ? req.file.filename : req.body.image;

  const product = {
    name,
    price: parseFloat(price),
    category,
    size: JSON.parse(size),
    description,
    image
  };

  updateProduct(id, product, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto actualizado', result });
  });
};

// DELETE producto
const deleteProductHandler = (req, res) => {
  const id = req.params.id;

  // primero obtener producto para eliminar la imagen del disco
  getProductById(id, (err, product) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    // eliminar archivo de imagen si existe
    if (product.image) {
      const imagePath = path.join(__dirname, '../uploads', product.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    deleteProduct(id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Producto eliminado', result });
    });
  });
};

module.exports = {
  getProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
};
