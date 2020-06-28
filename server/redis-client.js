const redis = require('redis');

const redisClient = redis.createClient(
  process.env.REDIS_URL || 'redis://localhost:6379',
);

module.exports = redisClient;
