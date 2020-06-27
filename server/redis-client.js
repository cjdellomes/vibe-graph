const redis = require('redis');

const redisClient = redis.createClient(
  process.env.REDIS_URL || 'localhost:6379',
);

module.exports = redisClient;
