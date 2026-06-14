// Punto de entrada principal del servidor A La Burger OS
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rutas = require('./src/routes/index');

// Inicializar la aplicación Express
const app = express();

// Puerto desde variables de entorno, con fallback a 3000
const PUERTO = process.env.PORT || 3000;

// ─── Middlewares globales ───────────────────────────────────────────────────

// Configurar CORS para aceptar peticiones del frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL típica de Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsear cuerpos JSON en las peticiones
app.use(express.json());

// Parsear cuerpos URL-encoded (formularios)
app.use(express.urlencoded({ extended: true }));

// ─── Rutas ─────────────────────────────────────────────────────────────────

// Montar todas las rutas bajo el prefijo /api
app.use('/api', rutas);

// ─── Manejo de rutas no encontradas ────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl,
  });
});

// ─── Manejo global de errores ──────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: err.message,
  });
});

// ─── Iniciar servidor ──────────────────────────────────────────────────────

app.listen(PUERTO, () => {
  console.log(`🍔 Servidor A La Burger OS corriendo en http://localhost:${PUERTO}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
});
