const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_1U7IBdhLgFSR@ep-muddy-paper-au5qplrv.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function init() {
  try {
    console.log('1. Conectando a Neon...');
    await client.connect();
    console.log('✅ Conectado exitosamente');
    
    console.log('2. Creando tablas...');
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('✅ Tablas base creadas');
    
    console.log('3. Asegurando tabla refresh_tokens...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla refresh_tokens creada');

    console.log('4. Verificando usuarios...');
    const res = await client.query('SELECT COUNT(*) FROM usuarios');
    if (res.rows[0].count === '0') {
      console.log('   Creando usuario admin por defecto...');
      const hash = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO usuarios (username, password_hash, rol, nombre)
        VALUES ($1, $2, $3, $4)
      `, ['admin', hash, 'admin', 'Administrador Principal']);
      console.log('✅ Usuario admin creado (admin / admin123)');
    } else {
      console.log('✅ Los usuarios ya existen');
    }
    
    console.log('🎉 BASE DE DATOS LISTA!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
}

init();
