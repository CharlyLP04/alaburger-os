// Controlador de pagos — integración con Stripe (modo test)
const Stripe = require('stripe');
const pool = require('../config/db');

// La clave secreta SIEMPRE se lee de variables de entorno, nunca hardcodeada.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * crearIntentoPago — crea un Payment Intent en Stripe por el total
 * de un pedido existente y lo deja listo para cobrarse desde el
 * frontend (Stripe.js / Payment Element).
 */
const crearIntentoPago = async (req, res) => {
  try {
    const { pedido_id } = req.body;

    // Validación de datos de entrada
    if (!pedido_id || isNaN(Number(pedido_id))) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'pedido_id es obligatorio y debe ser numérico.',
      });
    }

    const resultado = await pool.query(
      `SELECT id, total, estado_pago FROM pedidos WHERE id = $1`,
      [pedido_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: 'No encontrado',
        mensaje: `No existe un pedido con id ${pedido_id}.`,
      });
    }

    const pedido = resultado.rows[0];

    if (pedido.estado_pago === 'pagado') {
      return res.status(409).json({
        error: 'Pedido ya pagado',
        mensaje: 'Este pedido ya tiene un pago registrado.',
      });
    }

    const totalEnCentavos = Math.round(parseFloat(pedido.total) * 100);

    if (totalEnCentavos <= 0) {
      return res.status(400).json({
        error: 'Monto inválido',
        mensaje: 'El pedido debe tener un total mayor a cero para procesar el pago.',
      });
    }

    // Llamada real a la API externa de Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalEnCentavos,
      currency: 'mxn',
      metadata: { pedido_id: String(pedido.id) },
      automatic_payment_methods: { enabled: true },
    });

    await pool.query(
      `UPDATE pedidos SET stripe_payment_intent_id = $1, updated_at = NOW() WHERE id = $2`,
      [paymentIntent.id, pedido.id]
    );

    return res.status(201).json({
      mensaje: 'Intento de pago creado correctamente',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      total: parseFloat(pedido.total),
    });
  } catch (error) {
    console.error('Error al crear intento de pago:', error);

    // Errores propios de Stripe (tarjeta, parámetros, autenticación con la API, etc.)
    if (error.type && error.type.startsWith('Stripe')) {
      return res.status(400).json({
        error: 'Error de Stripe',
        mensaje: error.message,
      });
    }

    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: error.message,
    });
  }
};

/**
 * confirmarPago — se consulta directamente a Stripe el estado real
 * del Payment Intent y se sincroniza con la base de datos local.
 * Esto es lo que se mostrará como "evidencia de integración" porque
 * hace un round-trip completo: nuestra API -> Stripe -> nuestra API.
 */
const confirmarPago = async (req, res) => {
  try {
    const { payment_intent_id } = req.params;

    if (!payment_intent_id) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'payment_intent_id es obligatorio.',
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    const nuevoEstado = paymentIntent.status === 'succeeded' ? 'pagado' : 'pendiente';

    const resultado = await pool.query(
      `UPDATE pedidos
       SET estado_pago = $1, updated_at = NOW()
       WHERE stripe_payment_intent_id = $2
       RETURNING id, total, estado_pago`,
      [nuevoEstado, payment_intent_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: 'No encontrado',
        mensaje: 'No hay un pedido asociado a ese payment_intent_id.',
      });
    }

    return res.status(200).json({
      mensaje: 'Estado de pago sincronizado con Stripe',
      estadoStripe: paymentIntent.status,
      pedido: resultado.rows[0],
    });
  } catch (error) {
    console.error('Error al confirmar pago:', error);

    if (error.type && error.type.startsWith('Stripe')) {
      return res.status(400).json({
        error: 'Error de Stripe',
        mensaje: error.message,
      });
    }

    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: error.message,
    });
  }
};

module.exports = { crearIntentoPago, confirmarPago };
