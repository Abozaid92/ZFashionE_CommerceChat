const redis = require("../redisClient"); // 👈 لازم تستدعي ريديس هنا كمان

module.exports = (io, socket, roomId) => {
  socket.on("set_type_status", ({ typeStatus }) => {
    // console.log("this is  set_type_status", typeStatus);
    // console.log(roomId);
    // console.log(io.sockets.adapter.rooms.get(roomId));
    socket.to(roomId).emit("type_status", { typeStatus: typeStatus });
    // socket.on("type_status", (data) => {
    //   console.log("data server typeingdata", data);
    // });
  });
};
