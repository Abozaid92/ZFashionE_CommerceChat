const prisma = require("../../lib/db");

const insertDateIntoDb = async (products, type, date) => {
  if (!products || products.length === 0) return;

  try {
    await prisma.$transaction(
      products.map((product) =>
        prisma.productAnalyticsByDay.upsert({
          where: {
            productSlug_type_createdAt: {
              productSlug: product.slug,
              type: type,
              createdAt: date,
            },
          },
          update: {
            count: Math.floor(product.score),
          },
          create: {
            productSlug: product.slug,
            type: type,
            count: Math.floor(product.score),
            createdAt: date,
          },
        }),
      ),
    );
    // console.log(
    // `[DB] Successfully synced ${products.length} products for type: ${type}`,
    // );
  } catch (error) {
    console.error("🚨 Database Bulk Upsert Error:", error.message);
    throw error; // بنرمي الخطأ عشان الفانكشن اللي فوق تحس بيه
  }
};
const convertRedisDataToArrOfObj = (rawArray) => {
  const list = [];
  for (let i = 0; i < rawArray.length; i += 2) {
    list.push({
      slug: rawArray[i],
      score: parseInt(rawArray[i + 1]) || 0,
    });
  }
  return list;
};

module.exports = { insertDateIntoDb, convertRedisDataToArrOfObj };
