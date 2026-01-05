const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const txs = await prisma.transaction.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        category: { select: { id: true, name: true } },
        account: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    console.log('OK', txs.length);
    console.log(JSON.stringify(txs, null, 2));
  } catch (e) {
    console.error('ERR');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
