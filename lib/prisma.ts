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

    global.prisma.$on("query", (e) => {
      try {
        console.debug("[prisma][query]", e.query, e.params, "durationMs:", e.duration);
      } catch (err) {
        console.debug("[prisma][query] (failed to serialize)", err);
      }
    });

    global.prisma.$on("info", (e) => console.info("[prisma][info]", e.message));
    global.prisma.$on("warn", (e) => console.warn("[prisma][warn]", e.message));
    global.prisma.$on("error", (e) => console.error("[prisma][error]", e.message));
  }
  return global.prisma;
}
