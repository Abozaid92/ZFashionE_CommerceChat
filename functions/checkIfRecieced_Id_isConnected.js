const loopToGetUsersInRoom = require("../functions/loopToGetUSersInRoom");
const getUsersInRoom = require("../functions/getUserinRoom");
const redis = require("../redisClient");

// fn
async function checkIfRecieced_Id_isConnected(roomId, userId) {
  try {
    const users = await getUsersInRoom(roomId, "calcConnections");
    const recievedId = await loopToGetUsersInRoom(users, userId);
    const result = await checkIfRecieced_Id_isConnected_inRedis(recievedId);
    return result;
  } catch (e) {
    // صمت تام في حالة الخطأ لضمان استقرار السيرفر
    return { isDeliverd: false, recievedId: null };
  }
}

async function checkIfRecieced_Id_isConnected_inRedis(recievedId) {
  let isDeliverd = false;
  try {
    // استعلام Redis محمي بالكامل
    const connectionsCount = await redis.scard(
      `user_connections::${recievedId}`,
    );
    if (connectionsCount > 0) {
      isDeliverd = true;
    }
  } catch (e) {
    // صمت تام هنا أيضاً
  }

  return { isDeliverd, recievedId };
}

module.exports = checkIfRecieced_Id_isConnected;
