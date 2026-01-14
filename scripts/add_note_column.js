const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load .env
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const m = content.match(/^DATABASE_URL=(.*)$/m);
  if (m) process.env.DATABASE_URL = m[1].trim().replace(/^"|"$/g, '');
}

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Running ALTER TABLE to add column note if not exists...');
    await prisma.$executeRawUnsafe(`ALTER TABLE \"Customer\" ADD COLUMN IF NOT EXISTS \"note\" TEXT;`);
    console.log('ALTER TABLE executed.');
  } catch (err) {
    console.error('Error executing ALTER TABLE:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
