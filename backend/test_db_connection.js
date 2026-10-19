require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  console.log('Testing connection to:', process.env.DATABASE_URL);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    const r = await pool.query('SELECT current_database(), current_user, version()');
    console.log('✅ Connected successfully!', r.rows[0]);
    const ext = await pool.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'");
    console.log('✅ pgvector extension:', ext.rows[0]);
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('✅ Tables:', tables.rows.map(t => t.table_name));
    await pool.end();
    process.exit(0);
  } catch (e) {
    console.error('Full Error Object:', e);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

main();
