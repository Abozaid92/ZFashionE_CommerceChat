// order = cart 💨💨

const getDetailsOfTodays = require("../getDetailsOfToday");
const redis = require("../../redisClient");
const { AnalyticsType } = require("@prisma/client");
const {
  insertDateIntoDb,
  convertRedisDataToArrOfObj,
} = require("./insertDateIntoDb");

const purchaseAnalyticsinsert = async () => {
  // console.log(
  //   `[${new Date().toISOString()}] 🚀 Starting Product Leaderboard Sync...`,
  // );

  try {
    const { startOfToday } = getDetailsOfTodays();

    let topProductsRaw = [];

    try {
      topProductsRaw = await redis.zrange(
        "stats:leaderboardProducts:inOrders",
        0,
        9,
        {
          rev: true,
          withScores: true,
        },
      );
    } catch (redisError) {
      console.error("🚨 Redis Failure in Cron:", redisError.message);
      return;
    }
    // console.log(
    //   `📊 PURCHASE this is top product before filre beforre condition  ${topProductsRaw}`,
    // );

    if (!topProductsRaw || topProductsRaw.length === 0) {
      // console.log("ℹ️ No data in Redis to sync.");
      return;
    }
    // console.log(
    //   `📊 PURCHASE this is top product before filrer ${topProductsRaw}`,
    // );

    const filterdProducts = convertRedisDataToArrOfObj(topProductsRaw);
    await insertDateIntoDb(
      filterdProducts,
      AnalyticsType.PURCHASE,
      startOfToday,
    );

    // console.log("🏁 Product Analytics Sync Completed Successfully!");
  } catch (error) {
    console.error(
      "🚨 Critical error in purchaseAnalyticsinsert:",
      error.message,
    );
  }
};

module.exports = purchaseAnalyticsinsert;
