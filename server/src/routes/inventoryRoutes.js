const express = require('express');
const { obtenerInventario, crearIngrediente } = require('../controllers/inventoryController');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/checkRole');

const router = express.Router();

router.get('/', verificarToken, obtenerInventario);
router.post('/', verificarToken, verificarRol('administrador'), crearIngrediente);

module.exports = router;
