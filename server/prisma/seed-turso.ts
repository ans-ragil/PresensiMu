import { createClient } from '@libsql/client/http';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('Seeding Turso database...');

  // Check if users already exist
  const existing = await client.execute('SELECT COUNT(*) as count FROM User');
  const count = Number(existing.rows[0].count);
  if (count > 0) {
    console.log(`Database already has ${count} users. Skipping seed.`);
    return;
  }

  // Super Admin
  const superAdminPass = await bcrypt.hash('superadmin123', 10);
  await client.execute({
    sql: `INSERT INTO User (id, nama, email, password, role, noTelp, jabatan, divisi, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [crypto.randomUUID(), 'Super Administrator', 'superadmin@presensimu.com', superAdminPass, 'SUPER_ADMIN', '081234567888', 'Super Admin', 'IT', true, new Date().toISOString(), new Date().toISOString()]
  });
  console.log('✓ Super Admin created');

  // HR
  const hrPass = await bcrypt.hash('hr123', 10);
  await client.execute({
    sql: `INSERT INTO User (id, nama, email, password, role, noTelp, jabatan, divisi, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [crypto.randomUUID(), 'HR Manager', 'hr@presensimu.com', hrPass, 'HR', '081234567877', 'HR Manager', 'Human Resources', true, new Date().toISOString(), new Date().toISOString()]
  });
  console.log('✓ HR created');

  // Admin
  const adminPass = await bcrypt.hash('admin123', 10);
  await client.execute({
    sql: `INSERT INTO User (id, nama, email, password, role, noTelp, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [crypto.randomUUID(), 'Administrator', 'admin@presensimu.com', adminPass, 'ADMIN', '081234567890', true, new Date().toISOString(), new Date().toISOString()]
  });
  console.log('✓ Admin created');

  // Employee
  const empPass = await bcrypt.hash('karyawan123', 10);
  await client.execute({
    sql: `INSERT INTO User (id, nama, email, password, role, noTelp, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [crypto.randomUUID(), 'Sample Karyawan', 'karyawan@presensimu.com', empPass, 'EMPLOYEE', '081234567891', true, new Date().toISOString(), new Date().toISOString()]
  });
  console.log('✓ Employee created');

  // Company Location
  await client.execute({
    sql: `INSERT INTO CompanyLocation (id, nama, latitude, longitude, radius, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [crypto.randomUUID(), 'Kantor Pusat', -6.2088, 106.8456, 500, new Date().toISOString(), new Date().toISOString()]
  });
  console.log('✓ Company location created');

  console.log('\nSeed completed!');
}

main().catch(console.error);
