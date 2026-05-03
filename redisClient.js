require("dotenv").config();
const { Redis } = require("@upstash/redis");
const redis = new Redis({
  url: "https://oriented-pig-15280.upstash.io",
  token: process.env.REDIS_TOKEN,
});

module.exports = redis;
