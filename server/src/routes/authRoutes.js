const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/authLimiter');

// Cuando hagan POST a /login, pasará por el limitador y luego al controlador
router.post('/login', loginLimiter, authController.login);

module.exports = router;