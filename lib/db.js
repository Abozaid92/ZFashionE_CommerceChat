const { PrismaClient } = require("@prisma/client");
const { AnalyticType } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = prisma;
