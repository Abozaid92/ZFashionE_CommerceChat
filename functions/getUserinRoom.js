const redis = require("../redisClient");

async function getUserinRoom(roomId, typeClac = "All") {
  try {
    let getUsersInRoom = null;

    if (typeClac !== "All") {
      getUsersInRoom = await redis.smembers(`room_calc_connections:${roomId}`);
    } else {
      getUsersInRoom = await redis.smembers(`room:${roomId}`);
    }

    return getUsersInRoom;
  } catch (e) {
    return []; // بنرجع مصفوفة فاضية كأمان للـ functions اللي بتعمل loop على النتيجة
  }
}

module.exports = getUserinRoom;
