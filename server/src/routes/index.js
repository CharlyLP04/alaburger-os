// Enrutador principal — agrupa todas las rutas de la API
const express = require('express');
const router = express.Router();

// ─── Ruta de salud del servidor ────────────────────────────────────────────
// GET /api/health → verifica que el servidor esté activo
router.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'ok',
    proyecto: 'A La Burger OS',
    timestamp: new Date().toISOString(),
  });
});

// ─── Aquí se importarán las rutas de cada módulo ───────────────────────────
// Ejemplo futuro:
// const rutasUsuarios = require('./usuarios');
// const rutasProductos = require('./productos');
// const rutasPedidos   = require('./pedidos');
//
// router.use('/usuarios', rutasUsuarios);
// router.use('/productos', rutasProductos);
// router.use('/pedidos', rutasPedidos);

module.exports = router;
