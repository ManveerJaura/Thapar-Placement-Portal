const { redisClient } = require("../redisClient");

/**
 * Generic Redis cache middleware
 * @param {string} cacheKey - base key for caching
 * @param {number} ttl - time to live (in seconds)
 */
function cache(cacheKey, ttl = 300) {
  return async (req, res, next) => {
    try {
      const data = await redisClient.get(cacheKey);
      if (data) {
        console.log(`⚡ Cache hit: ${cacheKey}`);
        return res.json(JSON.parse(data));
      }

      // intercept res.json to cache the outgoing data
      const sendResponse = res.json.bind(res);
      res.json = (body) => {
        redisClient.setEx(cacheKey, ttl, JSON.stringify(body));
        console.log(`✅ Cache set: ${cacheKey} (expires in ${ttl}s)`);
        return sendResponse(body);
      };

      next();
    } catch (err) {
      console.error("Redis cache middleware error:", err);
      next(); // continue even if Redis fails
    }
  };
}

module.exports = cache;
