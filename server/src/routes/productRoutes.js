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
const { verificarToken, esAdministrador } = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, obtenerProductos); // public
router.get('/all', verificarToken, esAdministrador, obtenerTodosLosProductos);
router.get('/categorias', verificarToken, obtenerCategorias);
router.post('/', verificarToken, esAdministrador, crearProducto);
router.put('/:id', verificarToken, esAdministrador, actualizarProducto);
router.delete('/:id', verificarToken, esAdministrador, eliminarProducto);

// Recetas
router.get('/:id/receta', verificarToken, esAdministrador, obtenerReceta);
router.put('/:id/receta', verificarToken, esAdministrador, actualizarReceta);

module.exports = router;
