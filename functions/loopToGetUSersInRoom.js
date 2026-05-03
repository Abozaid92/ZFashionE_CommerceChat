function loopToGetUsersInRoom(getUsersInRoom, userId) {
  let recievedId = null;
  if (getUsersInRoom && getUsersInRoom.length > 0) {
    // هنلف على كل الناس اللي في الغرفة
    // // console.log(console.log($1););(
    // "--looop to get user in room-------------chekuser in room-",
    // getUsersInRoom,
    // );
    for (const itemId of getUsersInRoom) {
      // const clientSocket = io.sockets.sockets.get(itemId);
      // console.log(
      // `Checking: Socket UserID [${itemId}] vs My UserID [${userId}]`,
      // );
      // لو لقيت حد الـ ID بتاعه مختلف عني، يبقى هو ده الطرف التاني
      if (
        itemId &&
        itemId !== undefined &&
        itemId !== "undefined" &&
        itemId !== userId
      ) {
        recievedId = itemId;
        // console.log(console.log("FOUND TARGET USER:", recievedId););
        break;
      }
    }

    return recievedId;
  }
}

module.exports = loopToGetUsersInRoom;
