const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const url = process.env.DB_URL;

async function run() {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Conectando a la base de datos...');
    await client.connect();
    console.log('Conexión exitosa.');

    const sqlFiles = [
      'migration_rename_email_to_username.sql'
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, 'db', file);
      if (fs.existsSync(filePath)) {
        console.log(`Ejecutando ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`✅ ${file} completado.`);
      } else {
        console.log(`⚠️ Archivo ${file} no encontrado.`);
      }
    }

    console.log('🎉 Migración completada con éxito.');
  } catch (err) {
    console.error('❌ Error ejecutando SQL:', err);
  } finally {
    await client.end();
  }
}

run();
