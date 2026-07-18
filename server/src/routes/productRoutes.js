const express = require('express');
const {
  obtenerProductos,
  obtenerTodosLosProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerReceta,
  actualizarReceta
} = require('../controllers/productController');
const { verificarToken } = require('../middleware/auth');
const { verificarAdministrador } = require('../middleware/admin');

const router = express.Router();

router.get('/', verificarToken, obtenerProductos); // public
router.get('/all', verificarToken, obtenerTodosLosProductos);
router.get('/categorias', verificarToken, obtenerCategorias);
router.post(
  '/categorias',
  verificarToken,
  verificarAdministrador,
  crearCategoria
);

router.put(
  '/categorias/:id',
  verificarToken,
  verificarAdministrador,
  actualizarCategoria
);

router.delete(
  '/categorias/:id',
  verificarToken,
  verificarAdministrador,
  eliminarCategoria
);
router.post(
  '/',
  verificarToken,
  verificarAdministrador,
  crearProducto
);

router.put(
  '/:id',
  verificarToken,
  verificarAdministrador,
  actualizarProducto
);

router.delete(
  '/:id',
  verificarToken,
  verificarAdministrador,
  eliminarProducto
);

// Recetas
router.get('/:id/receta', verificarToken, obtenerReceta);
router.put('/:id/receta', verificarToken, actualizarReceta);

module.exports = router;
