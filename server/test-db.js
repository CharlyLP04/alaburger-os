require('dotenv').config();
const pool = require('./src/config/db');

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a DB_URL:', process.env.DB_URL);
    console.log('Resultado:', res.rows);
  } catch (err) {
    console.error('Error de conexión:', err);
  } finally {
    pool.end();
  }
}
test();
