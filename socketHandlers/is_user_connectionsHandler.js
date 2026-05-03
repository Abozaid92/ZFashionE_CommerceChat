const redis = require("../redisClient"); // 👈 لازم تستدعي ريديس هنا كمان
const getUserinRoom = require("../functions/getUserinRoom");
const loopToGetUsersInRoom = require("../functions/loopToGetUSersInRoom");
const dayjs = require("../lib/dayjs");

module.exports = (io, socket) => {
  socket.on("is_user_connected", async (data) => {
    try {
      // console.log("start in is_user_connected event with data:", data);

      // تغليف العمليات الداخلية لحماية السيرفر
      try {
        // 2. هات كل السوكيتات اللي في الغرفة دي حالياً
        const getUsers = await getUserinRoom(data.roomId);
        const usersInRoom = getUsers || []; // أمان إضافي لو القيمة رجعت null

        // console.log(`Users in room ${data.roomId}:`, usersInRoom);
        // console.log("--- DEBUG START ---");
        // console.log("Room ID:", data.roomId);
        // console.log("Total users here:", usersInRoom.length, usersInRoom);

        const recievedId = loopToGetUsersInRoom(usersInRoom, data.userId);

        // 3. لو ملقناش حد تاني (يعني أنت لوحدك في الغرفة)
        if (!recievedId) {
          // console.log("Status: You are alone in the room. No one to check.");
          socket.emit("user_connection_status", "offline");
          return;
        }

        // 4. لو لقينا الطرف التاني، نروح نسأل "ريديس" عن حالته
        const connectionStatus = await redis.get(
          `user_connection:${recievedId}`,
        );

        // معالجة الوقت والحالة
        let statusText = "";
        if (connectionStatus === "online") {
          statusText = "online";
        } else if (connectionStatus) {
          statusText = `last seen ${dayjs(parseInt(connectionStatus)).fromNow()}`;
        } else {
          statusText = "offline";
        }

        // console.log(
        // "Final Result - RecievedId:",
        // recievedId,
        // "Status:",
        // statusText,
        // );

        socket.emit("user_connection_status", statusText);
      } catch (innerError) {
        // الـ catch الخاصة بالمنطق الداخلي (يمكنك إضافة log هنا لو أردت)
      }
    } catch (e) {
      // Catch block فاضية تماماً لضمان عدم تأثر السيرفر بأي خطأ مفاجئ
    }
  });
};
