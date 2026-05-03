// order = cart 💨💨

const redis = require("../../redisClient");
const getDetailsOfTodays = require("../getDetailsOfToday");
const { AnalyticsType } = require("@prisma/client");
const {
  insertDateIntoDb,
  convertRedisDataToArrOfObj,
} = require("./insertDateIntoDb");

const orderAnytiycsInsert = async () => {
  // console.log(
  //   // `[${new Date().toISOString()}] 🚀 Starting Product Leaderboard Sync...`,
  // );

  try {
    const { startOfToday } = getDetailsOfTodays();

    let topProductsRaw = [];

    try {
      topProductsRaw = await redis.zrange(
        "stats:leaderboardProducts:incart",
        0,
        9,
        {
          rev: true,
          withScores: true,
        },
      );
      // console.log(`📊 this is top product before filrer ${topProductsRaw}`);
    } catch (redisError) {
      console.error("🚨 Redis Failure in Cron:", redisError.message);
      return;
    }

    if (!topProductsRaw || topProductsRaw.length === 0) {
      // console.log("ℹ️ No data in Redis to sync.");
      return;
    }
    const filterdProducts = convertRedisDataToArrOfObj(topProductsRaw);
    await insertDateIntoDb(filterdProducts, AnalyticsType.CART, startOfToday);

    // console.log("🏁 Product Analytics Sync Completed Successfully!");
  } catch (error) {
    console.error("🚨 Critical error in orderAnytiycsInsert:", error.message);
  }
};

module.exports = orderAnytiycsInsert;
