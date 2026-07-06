const express = require('express');
const { crearIntentoPago, confirmarPago } = require('../controllers/paymentController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Ambas rutas requieren sesión iniciada (JWT)
router.post('/crear-intento', verificarToken, crearIntentoPago);
router.get('/confirmar/:payment_intent_id', verificarToken, confirmarPago);

module.exports = router;
