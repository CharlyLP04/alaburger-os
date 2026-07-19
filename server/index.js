// Punto de entrada principal del servidor A La Burger OS
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const rutas = require('./src/routes/index');

// Inicializar la aplicación Express
const app = express();

// Necesario para Render/Heroku: confiar en el proxy reverso
app.set('trust proxy', 1);

// Puerto desde variables de entorno
const PUERTO = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: '*', // Permitir cualquier origen para evitar bloqueos en la app interna
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─────────────────────────────────────────────────────────────
// IMPORTANTE: LOS PARSERS VAN ANTES DE LAS RUTAS
// ─────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// RUTAS
// ─────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api', rutas);

// ─────────────────────────────────────────────────────────────
// 404
// ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl,
  });
});

// ─────────────────────────────────────────────────────────────
// ERROR GLOBAL
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: err.message,
  });
});

// ─────────────────────────────────────────────────────────────

// Exportar la aplicación para que Vercel Serverless Functions pueda manejarla
module.exports = app;

// Iniciar servidor solo si no estamos en el entorno serverless de Vercel
if (!process.env.VERCEL) {
  app.listen(PUERTO, () => {
    console.log(`🍔 Servidor A La Burger OS corriendo en http://localhost:${PUERTO}`);
    console.log(`📡 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
  });
}
