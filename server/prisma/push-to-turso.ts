import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: resolve(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const sqlPath = resolve(__dirname, 'schema.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await client.execute(stmt);
      console.log(`  ✓ Statement ${i + 1}/${statements.length}`);
    } catch (err: any) {
      // Ignore "already exists" errors
      if (err.message?.includes('already exists')) {
        console.log(`  ⏭ Statement ${i + 1}/${statements.length} (already exists)`);
      } else {
        console.error(`  ✗ Statement ${i + 1}/${statements.length}: ${err.message}`);
      }
    }
  }

  console.log('\nSchema pushed to Turso successfully!');
}

main().catch(console.error);
