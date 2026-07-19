const express = require('express');
const { getMetrics } = require('../controllers/dashboardController');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/checkRole');

const router = express.Router();

router.get('/metrics', verificarToken, verificarRol('administrador'), getMetrics);

module.exports = router;
