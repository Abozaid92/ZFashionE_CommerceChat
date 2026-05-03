const redis = require("../../redisClient"); // تأكد من مسار ملف إعداد الريديس عندك
const prisma = require("../../lib/db");

const insertAnalyticsViewIntoDb = async () => {
  try {
    // console.log("🔄 Starting data sync from Redis to PostgreSQL...");

    try {
      const pipeline = redis.pipeline();
      pipeline.getset("stats:homepage", 0);
      pipeline.getset("stats:products", 0);
      pipeline.getset("stats:about", 0);

      const results = await pipeline.exec();

      const data = {
        homepage: Number(results[0]) || 0,
        products: Number(results[1]) || 0,
        about: Number(results[2]) || 0,
      };
      // console.log("📊 Retrieved stats from Redis: result  ", results);
      // console.log("📊 Retrieved stats from Redis: data  ", data);
      if (data.homepage === 0 && data.products === 0 && data.about === 0) {
        // console.log("✅ No new visits to sync.");
        return;
      }

      const updatedStats = await prisma.Analytics.upsert({
        where: { id: 1 },
        update: {
          homapageVisits: { increment: data.homepage },
          productPageVisits: { increment: data.products },
          aboutPageVisits: { increment: data.about },
        },
        create: {
          id: 1,
          homapageVisits: data.homepage,
          productPageVisits: data.products,
          aboutPageVisits: data.about,
        },
      });
      const userEnterSync = await redis.get("stats:homepage");
      await redis.set(
        "stats:total:homepage",
        updatedStats.homapageVisits + (Number(userEnterSync) || 0),
      );

      // console.log(
      //   `🚀 Sync Successful! Added: Home(+${data.homepage}), Products(+${data.products}), About(+${data.about})`,
      // );
    } catch (error) {
      console.error("❌ Critical Error during sync:", error);
      // ملحوظة: في الأنظمة الضخمة ممكن هنا نرجع القيم للريديس لو فشلت الداتابيز
    }
  } catch (e) {}
};

module.exports = insertAnalyticsViewIntoDb;
