const redis = require("../redisClient"); // 👈 لازم تستدعي ريديس هنا كمان
const typing_statusHandler = require("./typing_StatusHandler");

module.exports = (io, socket) => {
  socket.on("roomId", async (roomId) => {
    try {
      // استدعاء Handler حالة الكتابة
      typing_statusHandler(io, socket, roomId);

      // انضمام السوكيت للغرفة في Socket.io
      await socket.join(roomId);

      // تغليف عمليات Redis بـ try...catch داخلي لحماية استقرار السيرفر
      try {
        // console.log(
        //   `User ${socket.handshake.query.userId} joined room ${roomId}`,
        // );
        // console.log("before ------------------------------------------->>>>");

        await redis.sadd(`room:${roomId}`, socket.handshake.query.userId);
        await redis.expire(`room:${roomId}`, 7200);

        // console.log(
        //   `User ${socket.handshake.query.userId} joined room ${roomId}`,
        // );
        // socket.emit("room_joined_ready", { roomId });

        // console.log(
        //   `User ${socket.handshake.query.userId} is officially in room ${roomId}`,
        // );
      } catch (innerRedisError) {
        console.error(
          `Redis error while joining room ${roomId} for user ${socket.handshake.query.userId}:`,
          innerRedisError,
        );
      }

      // منطق الـ Debugging والـ Logs الخاص بك
      // const clients = io.sockets.adapter.rooms.get(roomId);
      // console.log(
      //   `Number of clients in room in join ron handleeeeeer ${roomId}:`,
      //   clients,
      // );

      // إعلام الغرفة بأن المستخدم أصبح Online
      io.to(roomId).emit("user_connection_status", "online");
    } catch (e) {
      // Catch block فاضية تماماً لضمان عدم تأثر السيرفر بأي خطأ مفاجئ
    }
  });
};
