const redis = require("../redisClient"); // 👈 لازم تستدعي ريديس هنا كمان

module.exports = (io, socket) => {
  socket.on("leaveRoom", async (roomId) => {
    if (!roomId) return;
    try {
      // تغليف العمليات بـ try...catch خارجي لضمان بقاء السيرفر حياً
      try {
        // const clients = io.sockets.adapter.rooms.get(roomId);
        // console.log(
        //   `Number 💮💮💮💮of clients in room before leaveRoom${roomId}:`,
        //   clients,
        // );

        // عملية Redis محمية
        await redis.srem(`room:${roomId}`, socket.handshake.query.userId);

        // خروج السوكيت من الغرفة
        await socket.leave(roomId);

        // console.log(
        //   `Socket leaved succefully bro now you elaft ha ha ha haaaaaaaaaaaaaaaaaaaa${socket.id} successfully left room ${roomId}`,
        // );
      } catch (innerError) {
        // الـ catch الأصلية بتاعتك لو حبيت تسيب فيها الـ console.error
        console.error("Leave room error:", innerError);
      }
    } catch (e) {
      // Catch block فاضية تماماً كدرع حماية نهائي للسيرفر
    }
  });
};
