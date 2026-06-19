const express = require('express');
const { crearPedido } = require('../controllers/orderController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', verificarToken, crearPedido);

module.exports = router;
