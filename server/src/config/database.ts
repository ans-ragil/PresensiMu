import 'dotenv/config';
import { createClient } from '@libsql/client/http';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

const globalForDatabase = globalThis as unknown as {
  presensiMuPrisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL wajib dikonfigurasi');
  }

  if (url.startsWith('libsql://') && !authToken) {
    throw new Error('TURSO_AUTH_TOKEN wajib dikonfigurasi untuk Turso Cloud');
  }

  const libsql = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsql);

  return new PrismaClient({ adapter } as any);
}

// Cache the client across warm Vercel Function invocations.
const prisma = globalForDatabase.presensiMuPrisma ?? createPrismaClient();
globalForDatabase.presensiMuPrisma = prisma;

export default prisma;
