const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,                    // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,  // cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 10000, // timeout al conectar
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = pool;