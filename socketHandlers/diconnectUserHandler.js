const redis = require("../redisClient"); // تأكد من المسار صح لو الملف جوه فولدر socketHandlers
const axios = require("axios");
const dayjs = require("../lib/dayjs");

module.exports = (io, socket) => {
  socket.on("disconnect", async () => {
    try {
      const userId = socket.data.userId;

      // تغليف عمليات Redis و Socket لضمان استمرار السيرفر
      try {
        await redis.del(`user_status:noti_in_status:${userId}`);
        await redis.srem(`user_connections::${userId}`, socket.id);
        await redis.srem(`room:${userId}`, socket.handshake.query.userId);

        const remainingConnections = await redis.scard(
          `user_connections::${userId}`,
        );

        // console.log(
        // `Remaining connections for user ${userId}: ${remainingConnections}`,
        // );

        if (remainingConnections === 0) {
          await redis.set(`user_connection:${userId}`, Date.now());
        }

        // console.log(`User ${userId} disconnected`); // wrk succes and log

        socket.emit("is_user_connected", {
          roomId: "297f5711-f496-4ee8-ae29-18d3a2906e7a", // الغرفة الثابتة اللي عملناها
          userId: userId,
        });

        const connectionStatus = await redis.get(`user_connection:${userId}`);
        const lastSeenSince = dayjs(parseInt(connectionStatus)).fromNow();

        io.to("297f5711-f496-4ee8-ae29-18d3a2906e7a").emit(
          "user_connection_status",
          lastSeenSince,
        );
      } catch (innerError) {
        // الـ catch الأصلية للمنطق الداخلي لو حبيت تضيف فيها لوج مستقبلاً
      }
    } catch (e) {
      // Catch block فاضية تماماً لضمان عدم تأثر السيرفر بأي خطأ أثناء الـ disconnect
    }
  });
};
