const express = require('express');
const { obtenerInventario, crearIngrediente, editarIngrediente, registrarEntrada } = require('../controllers/inventoryController');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/checkRole');

const router = express.Router();

router.get('/', verificarToken, obtenerInventario);
router.post('/', verificarToken, verificarRol('administrador'), crearIngrediente);
router.put('/:id', verificarToken, verificarRol('administrador'), editarIngrediente);
router.post('/:id/entrada', verificarToken, verificarRol('administrador'), registrarEntrada);

module.exports = router;
