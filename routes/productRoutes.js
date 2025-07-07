// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler
} = require('../controllers/productController');

// Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Carpeta para guardar imágenes
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Rutas
router.get('/', getProducts); // GET /api/products - Obtener todos los productos
router.get('/:id', getProduct); // GET /api/products/:id - Obtener un producto por ID
router.post('/', upload.single('image'), createProductHandler); // POST /api/products - Crear producto con imagen
router.put('/:id', upload.single('image'), updateProductHandler); // PUT /api/products/:id - Actualizar producto
router.delete('/:id', deleteProductHandler); // DELETE /api/products/:id - Eliminar producto

module.exports = router;
