const express = require('express');
const { obtenerInventario } = require('../controllers/inventoryController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, obtenerInventario);

module.exports = router;
