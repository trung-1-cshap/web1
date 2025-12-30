// scripts/seed-admin.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const admins = [
    { email: 'NguyenDuyAn@gmail.com', password: 'admin@123', name: 'Nguyen Duy An' },
    { email: 'Trung@gmail.com', password: 'admin@123', name: 'Trung' },
    { email: 'Vinh@gmail.com', password: 'admin@123', name: 'Vinh' },
  ];

  const created = [];
  const existing = [];

  for (const a of admins) {
    const found = await prisma.user.findUnique({ where: { email: a.email } });
    if (found) {
      existing.push(a.email);
      continue;
    }
    const user = await prisma.user.create({
      data: { email: a.email, password: a.password, name: a.name, role: 'ADMIN' },
    });
    created.push({ email: user.email, id: user.id });
  }

  console.log('created:', created);
  console.log('existing:', existing);
}

main()
  .catch((e) => {
    console.error('Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
