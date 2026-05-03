const { createServer } = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const cleanRedis = require("./functions/cleanRedis");
const express = require("express"); // 1. ضفنا ده
const helmet = require("helmet"); // 2. ضفنا ده
const redis = require("./redisClient"); // استدعاء الملف اللي عملناه
const app = express(); // 3. عملنا "تطبيق" إكسبريس عشان يشيل الحماية
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      // السماح لاتصال السوكيت بالعمل
      connectSrc: [
        "'self'",
        "ws://localhost:3000",
        "http://localhost:3000",
        "ws://localhost:5000",
        "http://localhost:5000",
      ],
      scriptSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
    },
  }),
); // run
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 50000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// workers  & tasks
require("./tasks/workerBullmq"); // استدعاء ملف الوركر
require("./tasks/insertStatsIntoDbByCron");
// hadnlers
const joinRoomHandler = require("./socketHandlers/joinRoomHandler");
const join_Room_connection_Handler = require("./socketHandlers/join_Room_connection_Handler");
const leaveRoomHandler = require("./socketHandlers/leaveRoomHandler");
const sendmsgAndUserStatusHandler = require("./socketHandlers/sendmsgAndUserStatusHandler");
const is_user_connectionsHandler = require("./socketHandlers/is_user_connectionsHandler");
const disconnectUserHandler = require("./socketHandlers/diconnectUserHandler");
// user connect to Server
// user get on romm
// user send message
let message;
io.on("connection", async (socket) => {
  joinRoomHandler(io, socket);
  join_Room_connection_Handler(io, socket);
  leaveRoomHandler(io, socket);
  cleanRedis(io, socket.handshake.query.userId);
  const userId = socket.handshake.query.userId;
  socket.data.userId = userId; // -- if user in chat alert srver (don't save notifications)
  setUserConnection(socket.id, userId);
  sendmsgAndUserStatusHandler(io, socket);
  // check if user is online or not
  is_user_connectionsHandler(io, socket);
  // is user typing
  //  we transform it in (joinRoom) to get RoomId

  // disconnect
  disconnectUserHandler(io, socket);
});

const setUserConnection = async (socketId, userId) => {
  try {
    // await redis.sadd(`user_connections::${userId}`, socketId);
    // await redis.set(`user_connection:${userId}`, "online");
    // await redis.expire(`user_connection:${userId}`, 7200);
  } catch (e) {}
};
// في آخر الملف خالص عندك
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
