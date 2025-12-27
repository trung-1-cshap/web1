import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * KHÔNG khởi tạo Prisma ngay khi build
 * Chỉ khởi tạo khi runtime thực sự cần
 */
export function getPrisma() {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  return global.__prisma;
}
