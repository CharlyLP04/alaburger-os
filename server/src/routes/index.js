const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const inventoryRoutes = require('./inventoryRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'ok',
    proyecto: 'A La Burger OS',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/productos', productRoutes);
router.use('/pedidos', orderRoutes);
router.use('/pagos', paymentRoutes);
router.use('/inventario', inventoryRoutes);

module.exports = router;
