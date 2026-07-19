const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_1U7IBdhLgFSR@ep-muddy-paper-au5qplrv.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function fix() {
  try {
    await client.connect();
    console.log('Conectado a Neon...');

    await client.query('DROP TABLE IF EXISTS refresh_tokens;');
    
    await client.query(`
      CREATE TABLE refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
    `);
    console.log('Tabla refresh_tokens arreglada correctamente!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fix();
