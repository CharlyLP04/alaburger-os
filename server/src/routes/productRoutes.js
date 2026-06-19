const express = require('express');
const { obtenerProductos } = require('../controllers/productController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, obtenerProductos);

module.exports = router;
