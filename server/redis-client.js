const redis = require('redis');

const redisClient = redis.createClient(
  process.env.REDIS_URL || 'redis://localhost:6379',
);

redisClient.on('error', (err) => {
  console.error(err);
});

module.exports = redisClient;
