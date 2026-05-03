const z = require("zod");

const messageSchema = z.object({
  message: z.string(),
  userId: z.string(),
  roomId: z.string(),
});
module.exports = messageSchema;
