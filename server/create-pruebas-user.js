const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_1U7IBdhLgFSR@ep-muddy-paper-au5qplrv.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos...');

    const hash = await bcrypt.hash('pruebas', 10);
    
    // Check if the user already exists
    const res = await client.query('SELECT id FROM usuarios WHERE username = $1', ['pruebas']);
    
    if (res.rows.length > 0) {
      // Update password if it exists
      await client.query('UPDATE usuarios SET password_hash = $1 WHERE username = $2', [hash, 'pruebas']);
      console.log('Usuario "pruebas" actualizado exitosamente.');
    } else {
      // Insert if it doesn't exist
      await client.query(`
        INSERT INTO usuarios (nombre, apellido, username, password_hash, rol_id)
        VALUES ($1, $2, $3, $4, (SELECT id FROM roles WHERE nombre = 'administrador'))
      `, ['Usuario', 'Pruebas', 'pruebas', hash]);
      console.log('Usuario "pruebas" creado exitosamente.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
