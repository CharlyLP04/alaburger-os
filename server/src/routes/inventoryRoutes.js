const express = require('express');
const { obtenerInventario, crearIngrediente, editarIngrediente } = require('../controllers/inventoryController');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/checkRole');

const router = express.Router();

router.get('/', verificarToken, obtenerInventario);
router.post('/', verificarToken, verificarRol('administrador'), crearIngrediente);
router.put('/:id', verificarToken, verificarRol('administrador'), editarIngrediente);

module.exports = router;
