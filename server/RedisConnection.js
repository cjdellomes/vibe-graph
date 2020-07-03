class RedisConnection {
  constructor(redis, url) {
    this.client = redis.createClient(url);
  }

  connectApp(app) {
    this.client.on('connect', () => {
      console.log('cache connect');
      app.set('cacheConnected', true);
    });
    this.client.on('reconnecting', () => {
      console.log('cache reconnecting');
      app.set('cacheConnected', false);
    });
    this.client.on('end', () => {
      console.log('cache closed');
      app.set('cacheConnected', false);
    });
    this.client.on('error', (err) => {
      console.error('cache error: ', err);
      app.set('cacheConnected', false);
    });
  }

  async get(key) {
    const promise = new Promise((resolve, reject) => {
      this.client.get(key, (err, data) => {
        if (err) {
          console.log(err);
          console.log(data);
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });

    return promise
      .then((data) => data)
      .catch((error) => {
        console.error('get error: ', error);
      });
  }

  setex(key, expiration, data) {
    this.client.setex(
      key,
      expiration,
      JSON.stringify(data),
    );
  }
}

module.exports = RedisConnection;
