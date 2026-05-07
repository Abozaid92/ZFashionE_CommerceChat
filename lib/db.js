const { PrismaClient } = require("@prisma/client");

// ده بيمنع فتح اكتر من Connection في بيئة الـ Development والـ Serverless
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

module.exports = prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
