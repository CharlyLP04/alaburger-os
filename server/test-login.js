const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_1U7IBdhLgFSR@ep-muddy-paper-au5qplrv.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function test() {
  try {
    await client.connect();
    console.log('Conectado a Neon...');

    const username = 'admin';
    const password = 'admin123';

    console.log(`Buscando usuario: ${username}`);
    const resultado = await client.query(
      `SELECT u.id, u.nombre, u.apellido, u.username, u.password_hash, u.activo, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.username = $1`,
      [username.toLowerCase().trim()]
    );

    if (resultado.rows.length === 0) {
      console.log('❌ Usuario no encontrado en BD');
      return;
    }

    const usuario = resultado.rows[0];
    console.log(`✅ Usuario encontrado: ${usuario.username}, activo: ${usuario.activo}`);

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      console.log('❌ Contraseña inválida');
      return;
    }
    
    console.log('✅ Contraseña válida');

    // Simulate insert into refresh_tokens
    const crypto = require('crypto');
    const refreshToken = 'fake_refresh_token';
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    console.log('Insertando refresh token...');
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3)`,
      [usuario.id, tokenHash, expiresAt]
    );

    console.log('✅ Inserción de token exitosa. Todo el flujo DB funciona bien.');

  } catch (err) {
    console.error('❌ Error en el flujo:', err);
  } finally {
    await client.end();
  }
}

test();
