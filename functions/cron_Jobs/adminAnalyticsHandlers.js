const prisma = require("../../lib/db"); // مهم جداً عشان الفانكشنز تشوف الداتا بيز
const getDetailsOfTodays = require("../getDetailsOfToday");

const checkCurrentMonth = async (parentId) => {
  const now = new Date();

  // 1. تثبيت "البصمة": بنرجع لأول يوم في الشهر الحالي الساعة 12 بالليل
  // ده بيخلينا نلاقي "نفس السجل" طول الـ 30 يوم بتوع الشهر
  //   لو جربت تعدل الوقت باي طريقة تانيه هتركب الاداء
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 2. استخدام الـ upsert: دي أسرع وأضمن طريقة (بتحاول تجيب السجل، ولو مش موجود بتنشئه)
  // ملحوظة: لازم تتأكد إن فيه @@unique([chartAnalyticsId, createdAt]) في سكيما الـ Month
  const month = await prisma.chartAnalyticsByMonth.upsert({
    where: {
      // بنفترض إنك عامل index مركب فريد في السكيما، لو مش عامله استخدم findFirst الأول
      chartAnalyticsId_createdAt: {
        chartAnalyticsId: parentId,
        createdAt: startOfThisMonth,
      },
    },
    update: {}, // لو السجل موجود، مش محتاجين نغير فيه حاجة هنا
    create: {
      chartAnalyticsId: parentId,
      totalAnalytics: 0, // هيبدأ بصفر والكرون جوب هي اللي هتزوده
      createdAt: startOfThisMonth,
    },
  });

  return month;
};

// handlers

// 1. عد المستخدمين الجدد
const getNewUsersCount = async () => {
  const { startOfToday, endOfToday } = await getDetailsOfTodays();
  return await prisma.user.count({
    where: { createdAt: { gte: startOfToday, lt: endOfToday } },
  });
};

// 2. عد الطلبات الجديدة
const getNewOrdersCount = async () => {
  const { startOfToday, endOfToday } = await getDetailsOfTodays();
  return await prisma.order.count({
    where: { createdAt: { gte: startOfToday, lt: endOfToday } },
  });
};

const getTotalRevenue = async () => {
  const { startOfToday, endOfToday } = await getDetailsOfTodays();
  const result = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { createdAt: { gte: startOfToday, lt: endOfToday } },
  });
  return result._sum.totalAmount || 0;
};
const getTotalNet_Profit = async () => {
  const { startOfToday, endOfToday } = await getDetailsOfTodays();
  const result = await prisma.order.aggregate({
    _sum: { totalAmount: true }, // بنفترض إن عندك حقل اسمه totalAmount
    where: {
      createdAt: { gte: startOfToday, lt: endOfToday },
      status: "DELIVERED",
    },
  });
  return result._sum.totalAmount || 0;
};

const getComplaintsCount = async () => {
  const { startOfToday, endOfToday } = await getDetailsOfTodays();
  return await prisma.chatRoom.count({
    where: { createdAt: { gte: startOfToday, lt: endOfToday } },
  });
};

module.exports = {
  getNewUsersCount,
  getNewOrdersCount,
  getTotalRevenue,
  getTotalNet_Profit,
  getComplaintsCount,
  checkCurrentMonth,
  getDetailsOfTodays,
};
