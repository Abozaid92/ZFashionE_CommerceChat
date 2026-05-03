const { Worker } = require("bullmq");
const { adminMessaging } = require("../lib/firebase-admin");
const prisma = require("../lib/db");

// إعداد الاتصال بـ Upstash (Redis)
const connection = {
  url: process.env.REDIS_URL,
  // تصحيح: شلنا الـ _ عشان المكتبة تتعرف عليها وتحمي الكوتا
  maxRetriesPerRequest: 10,
};

const worker = new Worker(
  "push-notifications",
  async (job) => {
    if (job.name === "send-bulk-push") {
      const { title, body, url, image } = job.data;
      let lastId = undefined;
      let totalSent = 0;

      //
      // console.log(`\n🚀 [Worker] Starting notification process: "${title}"`);

      while (true) {
        // سحب 500 توكن فقط في المرة الواحدة باستخدام الـ Cursor
        const batch = await prisma.pushToken.findMany({
          take: 500,
          cursor: lastId ? { id: lastId } : undefined,
          skip: lastId ? 1 : 0,
          select: { id: true, token: true },
          orderBy: { id: "asc" }, // الترتيب بالـ ID لضمان دقة الـ Cursor
        });

        if (batch.length === 0) break;

        const tokens = batch.map((t) => t.token);
        lastId = batch[batch.length - 1].id;

        try {
          // إرسال الدفعة لفايربيز
          const response = await adminMessaging.sendEachForMulticast({
            tokens,
            notification: { title, body, imageUrl: image },
            data: {
              image: image || "",
              url: url || "/",
              click_action: url || "/",
            },
          });

          totalSent += response.successCount;
          // console.log(
          //   `📈 Progress: ${totalSent} notifications sent successfully...`,
          // );
        } catch (error) {
          console.error("❌ Error sending batch to Firebase:", error);
        }
      }

      // console.log(`✅ Task Completed! Total sent: ${totalSent}`);
      return { status: "completed", sent: totalSent };
    }
  },
  {
    connection,
    // التعديل المطلوب: الـ drainDelay مكانه هنا عشان يشتغل صح
    drainDelay: 3600,
    stalledInterval: 3600000, // يفتش على الشغل المعلق كل ساعة بس (بدل 30 ثانية)
    settings: {
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  },
);

// مراقبة أحداث الوركر (Monitoring)
worker.on("completed", (job) => {
  // console.log(`🎊 Job ID ${job.id} has been completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`💀 Job ID ${job.id} failed: ${err.message}`);
});

module.exports = worker;

// console.log("🏃‍♂️ Worker is now ONLINE and watching Upstash!");
