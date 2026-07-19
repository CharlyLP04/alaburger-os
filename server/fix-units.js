const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_1U7IBdhLgFSR@ep-muddy-paper-au5qplrv.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function fixUnits() {
  try {
    await client.connect();
    console.log('Conectado a Neon...');

    await client.query("UPDATE ingredientes SET unidad = 'pza' WHERE unidad = 'piezas'");
    await client.query("UPDATE ingredientes SET unidad = 'kg' WHERE unidad = 'kg'"); // just in case it's uppercase
    
    console.log('¡Unidades corregidas a pza!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixUnits();
