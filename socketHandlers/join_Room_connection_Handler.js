const redis = require("../redisClient"); // 👈 لازم تستدعي ريديس هنا كمان

module.exports = (io, socket) => {
  socket.on("join_Room_connection", async (roomId) => {
    try {
      // تغليف عملية Redis بـ try...catch لضمان استقرار السيرفر
      try {
        await redis.sadd(
          `room_calc_connections:${roomId}`,
          socket.handshake.query.userId,
        );
      } catch (innerError) {
        // يمكنك إضافة console.error هنا لو حبيت تتابع الأخطاء الداخلية
      }
    } catch (e) {
      // Catch block فاضية تماماً لضمان عدم تأثر السيرفر بأي خطأ مفاجئ
    }
  });
};
/* structer and cyclelife to handle with (update isDelevierd and isRead msg ) 
1-     --- main structer  ---
  A-   save in radis if isRead or isDelevired false (with Deffrent key)

2-     --- to Check meesage isDelevired = false ---
  A-  when call join_Room_connection (emit from front)
  B-  smembers to redis to get if user has message isDelevierd false 
  C-  smembers to redis to get if user has message isRead false 

3- 
  A- if isDelevierd : false updadeMAny in db
  B- if isRead : false updadeMAny in db

4-  --- update is read if user was connections and was close chat and then close it ---
  A-  when call roomId (meaning =>: join room when i open chat) (emit from front)
  B-  check if this user havd msg unread i redis 
  C-  if he has msg unread  send socket emit to front (to optimistic Updata)
  D - then save in db in hood

*/
