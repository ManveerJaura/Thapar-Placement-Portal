const {createClient} = require("redis");

const REDIS_URL = "redis://172.31.7.37:6379";

const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("❌ Redis reconnect failed after 10 attempts.");
        return new Error("Redis retry limit reached");
      }
      console.warn(`🔁 Redis reconnect attempt #${retries}`);
      return Math.min(retries * 500, 5000); // exponential backoff
    },
  },
});

redisClient.on('error', (err)=>{console.log("Redis Client error:",err)});
redisClient.on('connect',()=>{console.log("Redis Client Connecting...")});
redisClient.on('ready',()=>{console.log("Redis ready")});


async function connectTORedis() {
    try {
        if (!redisClient.isOpen) await redisClient.connect();
        console.log("✅ Redis connected successfully");
        return;
    } catch (err) {
        console.error("Redis connection failed, retrying...", err);
        await new Promise(res => setTimeout(res, 2000));
    }
}

module.exports = {redisClient,connectTORedis};