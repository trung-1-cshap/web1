import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export function getPrisma() {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: [
        { level: "query", emit: "event" },
        { level: "info", emit: "event" },
        { level: "warn", emit: "event" },
        { level: "error", emit: "event" },
      ],
    });

    (global.prisma as any).$on("query", (e: any) => {
      try {
        console.debug("[prisma][query]", e.query, e.params, "durationMs:", e.duration);
      } catch (err) {
        console.debug("[prisma][query] (failed to serialize)", err);
      }
    });

    (global.prisma as any).$on("info", (e: any) => console.info("[prisma][info]", e.message));
    (global.prisma as any).$on("warn", (e: any) => console.warn("[prisma][warn]", e.message));
    (global.prisma as any).$on("error", (e: any) => console.error("[prisma][error]", e.message));
  }
  return global.prisma;
}
