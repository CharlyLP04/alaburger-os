// Punto de entrada principal del servidor A La Burger OS
require('dotenv').config();

//const authRoutes = require('./routes/authRoutes');
const express = require('express');
const cors = require('cors');
const rutas = require('./src/routes/index');

// Inicializar la aplicación Express
const app = express();

// Puerto desde variables de entorno, con fallback a 3000
const PUERTO = process.env.PORT || 3000;

// ─── Middlewares globales ───────────────────────────────────────────────────

// Configurar CORS para aceptar peticiones del frontend
// FRONTEND_URL puede ser una lista separada por comas: url1,url2
const origenesPermitidos = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(u => u.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (ej. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (origenesPermitidos.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para origen: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

//app.use('/api/auth', authRoutes);

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
