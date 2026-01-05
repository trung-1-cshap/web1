const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const txs = await prisma.transaction.findMany({ where: { deleted: false }, orderBy: { createdAt: 'desc' }, take: 5 });
    console.log('OK', txs.length);
    console.log(JSON.stringify(txs, null, 2));
  } catch (e) {
    console.error('ERR');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
