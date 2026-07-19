// Punto de entrada principal del servidor A La Burger OS
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const rutas = require('./src/routes/index');

// Inicializar la aplicación Express
const app = express();

// Puerto desde variables de entorno
const PUERTO = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

const origenesPermitidos = [
  'http://localhost:5173',
  'http://localhost:4173',
  // URLs de Vercel (producción) - se permite cualquier subdominio del proyecto
  'https://alaburgeros-charlys-projects-ae36c62e.vercel.app',
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
    : []),
];

// Patrón para aceptar cualquier URL de despliegue de Vercel del proyecto
const vercelPattern = /^https:\/\/alaburger[a-z0-9-]*-charlys-projects-ae36c62e\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (origenesPermitidos.includes(origin) || vercelPattern.test(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS bloqueado para origen: ${origin}`));
    },
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
