const { Client } = require('pg');

// Try the external URL that worked before
const url = 'postgresql://alaburger_db_user:jYQJGGAif4XPEIyef1z7AbyDMwTIwrHw@dpg-d9e6nb3tqb8s739t3gtg-a.virginia-postgres.render.com/alaburger_db';

console.log('Connecting to:', url.split('@')[1]);

const client = new Client({ 
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

client.connect()
  .then(async () => {
    console.log('Connected!');
    const res = await client.query('SELECT NOW()');
    console.log('DB time:', res.rows[0]);
    await client.end();
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
