const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_1U7IBdhLgFSR@ep-muddy-paper-au5qplrv.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function createTable() {
  try {
    await client.connect();
    console.log('Conectado a Neon...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS movimientos_inventario (
          id              SERIAL          PRIMARY KEY,
          ingrediente_id  INTEGER         NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
          tipo            VARCHAR(20)     NOT NULL CHECK (tipo IN ('entrada', 'salida', 'merma', 'ajuste')),
          cantidad        NUMERIC(12, 3)  NOT NULL,
          motivo          TEXT,
          referencia      VARCHAR(100),
          costo_unitario  NUMERIC(10, 2),
          usuario_id      INTEGER         REFERENCES usuarios(id) ON DELETE SET NULL,
          fecha           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
          created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_movimientos_inv_ing ON movimientos_inventario(ingrediente_id);
      CREATE INDEX IF NOT EXISTS idx_movimientos_inv_fecha ON movimientos_inventario(fecha);
    `);
    
    console.log('¡Tabla movimientos_inventario creada!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

createTable();
