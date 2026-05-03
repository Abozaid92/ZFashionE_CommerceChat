const redis = require("../redisClient"); // 👈 لازم تستدعي ريديس هنا كمان
const messageSchema = require("../utils/messageSchema");
const prisma = require("../lib/db");
const loopToGetUsersInRoom = require("../functions/loopToGetUSersInRoom");
const getUserinRoom = require("../functions/getUserinRoom");
const DOMAIN = require("../lib/constants");
const { adminMessaging } = require("../lib/firebase-admin");
// canceld!!!
/*
    const checkIfRecieced_Id_isConnected = require("../functions/checkIfRecieced_Id_isConnected");
    const checkIfRecieced_Id_is_In_chat = require("../functions/checkIfRecieced_Id_is_In_chat");
*/
module.exports = (io, socket) => {
  socket.on("send_message", async (data) => {
    // console.log("i received a data and i will send it to receiece", data);

    socket.emit("is_message_sent", { messageId: data.id, data: data });
    io.to(data.roomId).emit("receive_message", data);
    // push notification logic
    const payload = {
      roomId: data.roomId,
      userId: data.userId,
      sender: data.sender,
      message: data.message,
    };
    await pushNotificationLogic(payload);
    // canceld!!!
    /*
     const clients = io.sockets.adapter.rooms.get(data.roomId);
     console.log(`Number of clients in room ${data.roomId}:`, clients);
    --this logic belong to isRead & isREcived -----------------------------------
     const allRooms = io.sockets.adapter.rooms;
   console.log("this is all rooms and  user 💌💌💌💌", allRooms);
    io.to(data.roomId).emit("receive_message", data);
    */
    try {
      const validation = messageSchema.safeParse(data);
      if (!validation.success) {
        return { error: "Invalid message data" };
      }
      // canceld!!!
      // //  is_user_in_chat on
      // const isDelevired = await checkIfRecieced_Id_isConnected(
      //   data.roomId,
      //   data.userId,
      // ); //true
      // const isRead = await checkIfRecieced_Id_is_In_chat(
      //   data.roomId,
      //   data.userId,
      // ); // true
      // const recievedid = isDelevired.recievedId;
      // data.isRead = isRead;
      // data.isDelevired = isDelevired;
      // if (!isDelevired.isDeliverd || !recievedid) {
      //   await redis.sadd(`undelivered_messages:${recievedid}`, data.roomId);
      // } else if (!isRead || !recievedid) {
      //   await redis.sadd(`unRead_messages:${recievedid}`, data.roomId);
      // }
      // console.log("this is is read", isRead);
      // console.log("this is is deleverd", isDelevired);
      // check if user have room
      await prisma.chatRoom.upsert({
        where: {
          id: data.roomId,
        },
        create: {
          id: data.roomId,
          userId: data.roomId,
          messages: {
            create: {
              message: data.message,
              userId: data.userId,
              // isDelivered: isDelevired.isDeliverd,
              // isRead: isRead,
            },
          },
        },
        update: {
          updatedAt: new Date(), // عشان تطلع فوق عند الأدمن
          messages: {
            create: {
              message: data.message,
              userId: data.userId,
              // isDelivered: isDelevired.isDeliverd,
              // isRead: isRead,
            },
          },
        },
      });
    } catch (error) {
      console.error(" faild to save message ", error);
    }
  });
  // listen and emit msg to admin (if him dosent exist in any chat )

  socket.on("sent-to-global-ear", async (data) => {
    // console.log("❤❤❤❤❤❤❤❤ we recived msg belhob", data);
    io.emit("global-ear-chat", data);
  });

  // send notifcation on chat icon is chat isOpen
  socket.on("user-status", async (status) => {
    // ----------key ........... value ------------------
    await redis.set(
      `user_status:noti_in_status:${status.userId}`,
      status.isOpen,
    );
    await redis.sadd(
      `user_status::${status.userId}`,
      `${status.isOpen}${socket.id}`,
    );
    await redis.expire(`user_status::${status.userId}`, 7200); // 2 hours in seconds
    await redis.set(`user_status:${status.userId}`, status.isOpen);
    await redis.expire(`user_status:${status.userId}`, 7200); // 2 hours in seconds
  });
};

const pushNotificationLogic = async (data) => {
  try {
    const recievedId = await loopToGetUsersInRoom(
      await getUserinRoom(data.roomId),
      data.userId,
    );
    const isRecievedIdInChat = await redis.get(
      `user_status:noti_in_status:${recievedId}`,
    );
    // console.log(
    //   "this is recieved id to check if he allow notification",
    //   isRecievedIdInChat,
    // );
    if (isRecievedIdInChat) return;
    const payload = getPayload(data);
    if (data.userId === data.roomId) {
      const getAdminTokens = await redis.smembers("admin:fcm_tokens");
      if (recievedId === null) await sentTOFireBase(getAdminTokens, payload);
    } else {
      //  ملحوظه بس طالما الايلس اتحققت يبقي الادمن الي بيبعت
      //  والمستقبل اليوزر
      const recievdToken = await getRecievedToken(data.roomId);
      if (!recievdToken || recievdToken.length === 0) {
        return "the recieved dosn't allow notifcation";
      }
      const tokens = recievdToken.map((el) => el.token);
      await sentTOFireBase(tokens, payload);
    }
  } catch (error) {
    console.error("Push Notification Logic Failed:", error);
  }
};
const getPayload = (data) => {
  const link =
    data.userId == data.roomId ?
      `${DOMAIN}/en/admin/support`
    : `${DOMAIN}/en?modal=true`;
  const payload = {
    notification: {
      title: `you have a new message from ${data.sender}`,
      body: data.message,
    },
    data: {
      url: link,
      click_action: link,
    },
    webpush: {
      fcmOptions: {
        link: link, // ده بيخلي المتصفح يفتح اللينك ده تلقائياً عند الضغط
      },
    },
  };
  return payload;
};
const sentTOFireBase = async (tokens, payload) => {
  await adminMessaging.sendEachForMulticast({
    tokens: tokens,
    ...payload,
  });
};
const getRecievedToken = async (recievedId) => {
  // console.log("this is recieved id to get his token", recievedId);
  const recievdToken = await prisma.pushToken.findMany({
    where: {
      userId: recievedId,
    },
    select: {
      token: true,
    },
  });

  return recievdToken;
};
