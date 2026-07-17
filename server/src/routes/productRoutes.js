const express = require('express');
const {
  obtenerProductos,
  obtenerTodosLosProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerReceta,
  actualizarReceta
} = require('../controllers/productController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, obtenerProductos); // public
router.get('/all', verificarToken, obtenerTodosLosProductos);
router.get('/categorias', verificarToken, obtenerCategorias);
router.post('/', verificarToken, crearProducto);
router.put('/:id', verificarToken, actualizarProducto);
router.delete('/:id', verificarToken, eliminarProducto);

// Recetas
router.get('/:id/receta', verificarToken, obtenerReceta);
router.put('/:id/receta', verificarToken, actualizarReceta);

module.exports = router;
