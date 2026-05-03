const prisma = require("../../lib/db");
const {
  getNewUsersCount,
  getNewOrdersCount,
  getTotalRevenue,
  getTotalNet_Profit,
  getComplaintsCount,
  checkCurrentMonth,
} = require("./adminAnalyticsHandlers");
const getDetailsOfTodays = require("../getDetailsOfToday");
const { AnalyticType } = require("@prisma/client");
initalParentTemperary().catch((err) =>
  console.error("Initial setup failed:", err),
);

const insertAdminAnalticsIntoDb = async () => {
  try {
    const { startOfToday } = await getDetailsOfTodays();

    const allAnalytics = await prisma.chartAnalytics.findMany({
      select: { id: true, nameAnalytics: true },
    });

    const analyticsHandlers = {
      USERS: getNewUsersCount,
      ORDERS: getNewOrdersCount,
      REVENUE: getTotalRevenue,
      NET_PROFIT: getTotalNet_Profit,
      COMPLAINTS: getComplaintsCount,
    };

    // console.log(`[${new Date().toISOString()}] 🚀 Starting Analytics Sync...`);

    for (const typeAnaltycs of allAnalytics) {
      const currentHandlers = analyticsHandlers[typeAnaltycs.nameAnalytics];

      if (!currentHandlers) {
        console.warn(
          `⚠️ No handler found for type: ${typeAnaltycs.nameAnalytics}`,
        );
        continue;
      }

      // أ- التأكد من وجود سجل الشهر
      const mounth = await checkCurrentMonth(typeAnaltycs.id);

      const currentTotalValue = await currentHandlers();

      // ج- اللمسة الأهم: حفظ اليوم وتحديث الشهر (العملية الفعلية)
      await prisma.$transaction([
        // 1. تسجيل اليوم
        prisma.chartAnalyticsByday.upsert({
          where: {
            chartAnalyticsByMonthId_createdAt: {
              chartAnalyticsByMonthId: mounth.id,
              createdAt: startOfToday,
            },
          },
          update: {
            totalAnalytics: currentTotalValue,
          },
          create: {
            chartAnalyticsByMonthId: mounth.id,
            totalAnalytics: currentTotalValue,
            createdAt: startOfToday,
          },
        }),
        // ركز في الكومنتات دي يحمصه
        // التعليقات دي مهمه يحمصه لو حبيت تخلي التحديث اليومي يحصل طكل ساعه مثلا
        // 2. تحديث التراكمي في الشهر
        // نصيحة: لو الكرون شغال كتير، الأفضل تحسب الـ Delta (الفرق)
        // أو تخلي الشهر يتحسب في كرون جوب تانية مرة واحدة في اليوم.
        prisma.chartAnalyticsByMonth.update({
          where: { id: mounth.id },
          data: { totalAnalytics: { increment: currentTotalValue } },
        }),
      ]);

      // console.log(
      //   `✅ Processed ${typeAnaltycs.nameAnalytics}: +${currentTotalValue}`,
      // );
    }

    // console.log("🏁 Analytics Sync Completed Successfully!");
  } catch (error) {
    console.error("🚨 Critical error in day analytics:", error);
  }
};

// تم مسح تعريف checkCurrentMonth من هنا لأنه مستورد من الملف التاني (منعاً للتكرار)

async function initalParentTemperary() {
  // تأكد أن AnalyticType متاح (إما Enum من Prisma أو Object معرف)
  if (typeof AnalyticType === "undefined") return;

  const types = Object.values(AnalyticType);

  for (const type of types) {
    await prisma.chartAnalytics.upsert({
      where: { nameAnalytics: type },
      update: {},
      create: { nameAnalytics: type },
    });
  }
}

module.exports = { insertAdminAnalticsIntoDb };
