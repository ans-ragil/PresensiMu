import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminEmail = 'admin@presensimu.com';
  const adminPassword = 'admin123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await prisma.user.create({
      data: {
        nama: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        noTelp: '081234567890'
      }
    });

    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Create sample employee
  const employeeEmail = 'karyawan@presensimu.com';
  const employeePassword = 'karyawan123';

  const existingEmployee = await prisma.user.findUnique({
    where: { email: employeeEmail }
  });

  if (!existingEmployee) {
    const hashedPassword = await bcrypt.hash(employeePassword, 10);
    
    await prisma.user.create({
      data: {
        nama: 'Sample Karyawan',
        email: employeeEmail,
        password: hashedPassword,
        role: 'EMPLOYEE',
        noTelp: '081234567891'
      }
    });

    console.log(`Employee user created: ${employeeEmail}`);
  } else {
    console.log(`Employee user already exists: ${employeeEmail}`);
  }

  // Create default company location
  const existingLocation = await prisma.companyLocation.findFirst();

  if (!existingLocation) {
    await prisma.companyLocation.create({
      data: {
        nama: 'Kantor Pusat',
        latitude: -6.2088,
        longitude: 106.8456,
        radius: 500
      }
    });

    console.log('Default company location created');
  }

  // Create default holidays for 2024
  const holidays = [
    { nama: 'Tahun Baru', tanggal: new Date('2024-01-01') },
    { nama: 'Tahun Baru Imlek', tanggal: new Date('2024-02-10') },
    { nama: 'Isra Mi\'raj', tanggal: new Date('2024-02-08') },
    { nama: 'Nyepi', tanggal: new Date('2024-03-11') },
    { nama: 'Wafat Isa Almasih', tanggal: new Date('2024-03-29') },
    { nama: 'Hari Buruh', tanggal: new Date('2024-05-01') },
    { nama: 'Kenaikan Isa Almasih', tanggal: new Date('2024-05-09') },
    { nama: 'Hari Raya Waisak', tanggal: new Date('2024-05-23') },
    { nama: 'Hari Pancasila', tanggal: new Date('2024-06-01') },
    { nama: 'Idul Adha', tanggal: new Date('2024-06-17') },
    { nama: 'Tahun Baru Islam', tanggal: new Date('2024-07-07') },
    { nama: 'Hari Kemerdekaan', tanggal: new Date('2024-08-17') },
    { nama: 'Maulid Nabi', tanggal: new Date('2024-09-16') },
    { nama: 'Hari Sumpah Pemuda', tanggal: new Date('2024-10-28') },
    { nama: 'Hari Maulid Nabi', tanggal: new Date('2024-11-01') },
    { nama: 'Hari Pahlawan', tanggal: new Date('2024-11-10') },
    { nama: 'Hari Toleransi', tanggal: new Date('2024-11-22') },
    { nama: 'Hari Nusantara', tanggal: new Date('2024-12-04') },
    { nama: 'Hari Sakit Sedunia', tanggal: new Date('2024-12-12') },
    { nama: 'Natal', tanggal: new Date('2024-12-25') }
  ];

  for (const holiday of holidays) {
    const existing = await prisma.holiday.findFirst({
      where: { tanggal: holiday.tanggal }
    });

    if (!existing) {
      await prisma.holiday.create({
        data: holiday
      });
    }
  }

  console.log('Holidays created');

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
