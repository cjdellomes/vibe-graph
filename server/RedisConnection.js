class RedisConnection {
  constructor(redis, url) {
    if (redis == null) {
      this.client = null;
    } else {
      this.client = redis.createClient(url);
    }
  }

  connectApp(app) {
    if (this.client == null) {
      app.set('cacheConnected', false);
      return;
    }

    app.set('cacheConnected', true);

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
    if (this.client == null) {
      return null;
    }

    const promise = new Promise((resolve, reject) => {
      this.client.get(key, (err, data) => {
        if (err) {
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
    if (this.client == null) {
      return;
    }
    this.client.setex(key, expiration, JSON.stringify(data));
  }
}

module.exports = RedisConnection;
