const redis = require("../redisClient");

async function cleanRedis(io, userId) {
  try {
    const exiestingTabsForUserConnnections = await redis.smembers(
      `user_connections::${userId}`,
    );
    await cleanUser(
      exiestingTabsForUserConnnections,
      userId,
      io,
      `user_connections::`,
    );

    const exiestingTabsForUserStatus = await redis.smembers(
      `user_status::${userId}`,
    );
    await cleanUser(exiestingTabsForUserStatus, userId, io, `user_status::`);
  } catch (e) {
    // Silent catch - لضمان عدم توقف السيرفر أثناء عملية التنظيف
  }
}

async function cleanUser(
  exiestingTabsForUserConnnections,
  userId,
  io,
  typeSadd,
) {
  try {
    if (
      exiestingTabsForUserConnnections &&
      exiestingTabsForUserConnnections.length > 0
    ) {
      for (const socketId of exiestingTabsForUserConnnections) {
        if (!io.sockets.sockets.has(socketId)) {
          await redis.srem(`${typeSadd}${userId}`, socketId);
        }
      }
    }
  } catch (e) {
    // Silent catch
  }
}

module.exports = cleanRedis;
