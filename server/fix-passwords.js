const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_1U7IBdhLgFSR@ep-muddy-paper-au5qplrv.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function fixPasswords() {
  try {
    await client.connect();
    console.log('Conectado a Neon...');

    // Generate real hash for 'admin123'
    const hash = await bcrypt.hash('admin123', 10);
    
    // Update all users to have 'admin123'
    await client.query('UPDATE usuarios SET password_hash = $1', [hash]);
    
    console.log('¡Todas las contraseñas han sido reseteadas a "admin123" con el hash correcto!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixPasswords();
