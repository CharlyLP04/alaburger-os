const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { verificarToken } = require('../middleware/auth');
const { verificarRol } = require('../middleware/checkRole');

// All config routes require authentication and admin privileges
router.use(verificarToken, verificarRol('administrador'));

router.get('/', configController.getConfiguraciones);
router.put('/', configController.updateConfiguraciones);

module.exports = router;
