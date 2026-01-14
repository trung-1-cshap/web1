const fs = require('fs');
const path = require('path');

// Load DATABASE_URL from .env if present
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const m = content.match(/^DATABASE_URL=(.*)$/m);
  if (m) {
    process.env.DATABASE_URL = m[1].trim().replace(/^"|"$/g, '');
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const id = process.argv[2] || '22';
const note = process.argv[3] || 'Ghi chú kiểm tra';

(async () => {
  try {
    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: { note: String(note) },
    });
    console.log('Updated customer:');
    console.log(JSON.stringify(updated, null, 2));
  } catch (err) {
    console.error('Update error:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
