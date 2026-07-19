const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/authLimiter');

// 🛠️ CORRECCIÓN: Apuntamos al archivo 'auth' y usamos la función 'verificarToken'
const { verificarToken } = require('../middleware/auth'); 

// Cuando hagan POST a /login, pasará por el limitador y luego al controlador
router.post('/login', loginLimiter, authController.login);

// 🔄 🛠️ HU-02: Endpoint de Refresh Token (Emite un nuevo accessToken usando el refreshToken)
router.post('/refresh', authController.refreshSession);

// 🛠️ HU-02: Endpoint de Logout (Ruta protegida con tu middleware corregido)
router.post('/logout', verificarToken, authController.logout);

module.exports = router;