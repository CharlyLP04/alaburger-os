const express = require('express');
const { obtenerInventario, crearIngrediente, editarIngrediente, registrarEntrada, obtenerResumenStockBajo, obtenerMovimientos, registrarMerma } = require('../controllers/inventoryController');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/checkRole');

const router = express.Router();

router.get('/', verificarToken, obtenerInventario);
router.post('/', verificarToken, verificarRol('administrador'), crearIngrediente);
router.get('/alertas/resumen', verificarToken, obtenerResumenStockBajo);
router.put('/:id', verificarToken, verificarRol('administrador'), editarIngrediente);
router.post('/:id/entrada', verificarToken, verificarRol('administrador'), registrarEntrada);
router.get('/:id/movimientos', verificarToken, verificarRol('administrador'), obtenerMovimientos);
router.post('/:id/merma', verificarToken, verificarRol('administrador', 'cocina'), registrarMerma);

module.exports = router;
