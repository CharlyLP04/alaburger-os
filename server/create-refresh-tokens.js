const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://alaburger_db_user:jYQJGGAif4XPEIyef1z7AbyDMwTIwrHw@dpg-d9e6nb3tqb8s739t3gtg-a.virginia-postgres.render.com/alaburger_db', ssl: { rejectUnauthorized: false } });
client.connect().then(async () => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
    `);
    console.log('Tabla refresh_tokens creada exitosamente');
  } catch (e) {
    console.error('Error al crear tabla:', e);
  } finally {
    client.end();
  }
});
