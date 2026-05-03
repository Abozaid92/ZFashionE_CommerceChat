const loopToGetUsersInRoom = require("../functions/loopToGetUSersInRoom");
const getUsersInRoom = require("../functions/getUserinRoom");
const redis = require("../redisClient");

// fn
async function checkIfRecieced_Id_is_In_chat(roomId, userId) {
  try {
    const getUsers = await getUsersInRoom(roomId);
    const recievedId = await loopToGetUsersInRoom(getUsers, userId);
    const isRead = await checkIfRecieced_Id_is_in_chat_inRedis(recievedId);
    return isRead;
  } catch (e) {
    return false;
  }
}

async function checkIfRecieced_Id_is_in_chat_inRedis(recievedId) {
  let isRead = false;
  try {
    const userInRoonNumbers = await redis.scard(`room:${recievedId}`);
    if (userInRoonNumbers > 1) {
      isRead = true;
    }
  } catch (e) {
    // Silent fail
  }

  return isRead;
}

module.exports = checkIfRecieced_Id_is_In_chat;
