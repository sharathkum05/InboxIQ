import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { __prisma: PrismaClient | undefined }

export const db =
  globalForPrisma.__prisma ??
  (globalForPrisma.__prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }))

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = db
}
