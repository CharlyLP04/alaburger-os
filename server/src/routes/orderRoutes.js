const express = require('express');
const { crearPedido, obtenerPedidos, actualizarEstadoPedido } = require('../controllers/orderController');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/checkRole');

const router = express.Router();

router.post('/', verificarToken, crearPedido);
router.get('/', verificarToken, verificarRol('administrador'), obtenerPedidos);
router.patch('/:id/estado', verificarToken, verificarRol('administrador', 'cocina'), actualizarEstadoPedido);

module.exports = router;
