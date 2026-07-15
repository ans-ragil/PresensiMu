import 'dotenv/config';
import { createClient, type Client, type InStatement } from '@libsql/client/http';
import { createHash } from 'crypto';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) throw new Error('TURSO_DATABASE_URL wajib dikonfigurasi');
if (url.startsWith('libsql://') && !authToken) {
  throw new Error('TURSO_AUTH_TOKEN wajib dikonfigurasi untuk Turso Cloud');
}

const client = createClient({ url, authToken });
const migrationsDir = resolve(__dirname, 'migrations-turso');

function statementsFrom(sql: string): InStatement[] {
  const withoutComments = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  return withoutComments
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureMigrationTable(db: Client) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "_AppMigration" (
      "name" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "appliedAt" TEXT NOT NULL
    )
  `);
}

async function main() {
  await ensureMigrationTable(client);

  const appliedResult = await client.execute(
    'SELECT "name", "checksum" FROM "_AppMigration"'
  );
  const applied = new Map(
    appliedResult.rows.map((row) => [String(row.name), String(row.checksum)])
  );

  const files = readdirSync(migrationsDir)
    .filter((file) => /^\d+.*\.sql$/.test(file))
    .sort();

  for (const file of files) {
    const sql = readFileSync(resolve(migrationsDir, file), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const previousChecksum = applied.get(file);

    if (previousChecksum) {
      if (previousChecksum !== checksum) {
        throw new Error(`Checksum migration berubah setelah diterapkan: ${file}`);
      }
      console.log(`- skip ${file}`);
      continue;
    }

    const statements = statementsFrom(sql);
    await client.batch(
      [
        ...statements,
        {
          sql: 'INSERT INTO "_AppMigration" ("name", "checksum", "appliedAt") VALUES (?, ?, ?)',
          args: [file, checksum, new Date().toISOString()]
        }
      ],
      'write'
    );
    console.log(`✓ applied ${file}`);
  }

  console.log('Turso migrations are up to date.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
