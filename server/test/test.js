const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const redisMock = require('redis-mock');
const app = require('../app');
const spotify = require('../spotifyController');
const RedisConnection = require('../RedisConnection');

chai.use(chaiHttp);

describe('RedisConnection', () => {
  it('should create the client connection', () => {
    const url = 'redis://localhost:6379';
    const mockRedisConnection = new RedisConnection(redisMock, url);
    chai.assert.notEqual(mockRedisConnection.client, null);
  });
  it('should throw an exception given a null redis package', () => {
    const url = 'redis://localhost:6379';
    const f = () => new RedisConnection(null, url);
    chai.expect(f).to.throw(Error, 'Redis client creation error');
  });
  it('should set the cache connected status in the app settings to true', () => {
    const mockApp = express();
    mockApp.set('cacheConnected', false);

    const url = 'redis://localhost:6379';
    const mockRedisConnection = new RedisConnection(redisMock, url);

    mockRedisConnection.connectApp(mockApp);

    chai.assert.equal(mockApp.settings.cacheConnected, true);
  });
  it('should get the existing key value pair', async () => {
    const url = 'redis://localhost:6379';
    const mockRedisConnection = new RedisConnection(redisMock, url);
    const mockObject = {
      abc: 'blah',
    };

    mockRedisConnection.client.flushdb();
    mockRedisConnection.client.set('test', JSON.stringify(mockObject));

    const val = await mockRedisConnection.get('test');

    chai.assert.deepEqual(mockObject, val);
  });
  it('should return null when getting non existing key value pair', async () => {
    const url = 'redis://localhost:6379';
    const mockRedisConnection = new RedisConnection(redisMock, url);

    mockRedisConnection.client.flushdb();
    const val = await mockRedisConnection.get('test');

    chai.assert.equal(val, null);
  });
  it('should set the key value pair with an expiration', () => {
    const url = 'redis://localhost:6379';
    const mockRedisConnection = new RedisConnection(redisMock, url);
    const mockObject = {
      abc: 'blah',
    };

    mockRedisConnection.client.flushdb();
    mockRedisConnection.setex('test', 3600, mockObject);
    mockRedisConnection.client.get('test', (err, data) => {
      chai.assert.deepEqual(JSON.stringify(mockObject), data);
    });
  });
});

describe('SpotifyController', () => {
  describe('getToken', () => {
    it('should get a token', async () => {
      const token = await spotify.getToken();
      chai.assert.typeOf(token, 'string');
    });
  });
  describe('searchArtist', () => {
    it('should get a list of artists matching the given artist name', async () => {
      const artistName = 'the beatles';
      const token = await spotify.getToken();
      const artists = await spotify.searchArtist(artistName, token);
      chai.assert.notEqual(artists, null);
      chai.assert.isArray(artists);
      chai.assert.lengthOf(artists, 20);
      chai.assert.equal(artists[0].id, '3WrFJ7ztbogyGnTHbHJFl2');
    });
    it('should get an empty list of artists given a nonexisting artist name', async () => {
      const artistName = 'hgjaghjkadghjkaghjkghaghdghjkaghjkaglg';
      const token = await spotify.getToken();
      const artists = await spotify.searchArtist(artistName, token);
      chai.assert.notEqual(artists, null);
      chai.assert.isArray(artists);
      chai.assert.lengthOf(artists, 0);
    });
  });
  describe('getFirstArtist', () => {
    it('should get the first artist matching the given artist name', async () => {
      const artistName = 'akon';
      const token = await spotify.getToken();
      const artist = await spotify.getFirstArtist(artistName, token);
      chai.assert.notEqual(artist, null);
      chai.assert.typeOf(artist, 'object');
      chai.assert.equal(artist.id, '0z4gvV4rjIZ9wHck67ucSV');
    });
    it('should get a null object given a nonexisting artist name', async () => {
      const artistName = 'hasdjkglhasdjkghasdjkghasdg';
      const token = await spotify.getToken();
      const artist = await spotify.getFirstArtist(artistName, token);
      chai.assert.equal(artist, null);
    });
  });
  describe('getArtist', () => {
    it('should get an artist given an artist ID', async () => {
      const artistID = '3fMbdgg4jU18AjLCKBhRSm';
      const token = await spotify.getToken();
      const artist = await spotify.getArtist(artistID, token);
      chai.assert.notEqual(artist, null);
      chai.assert.typeOf(artist, 'object');
      chai.assert.equal(artist.id, '3fMbdgg4jU18AjLCKBhRSm');
      chai.assert.equal(artist.name, 'Michael Jackson');
    });
    it('should get a null object given a nonexisting artist ID', async () => {
      const artistID = 'abc';
      const token = await spotify.getToken();
      const artist = await spotify.getArtist(artistID, token);
      chai.assert.equal(artist, null);
    });
  });
  describe('getRelatedArtists', () => {
    it('should get a list of artists given an artist ID', async () => {
      const artistID = '3dz0NnIZhtKKeXZxLOxCam';
      const token = await spotify.getToken();
      const artists = await spotify.getRelatedArtists(artistID, token);
      chai.assert.notEqual(artists, null);
      chai.assert.isArray(artists);
      chai.assert.lengthOf(artists, 20);
    });
    it('should get a null object given a nonexisting artist ID', async () => {
      const artistID = 'abc';
      const token = await spotify.getToken();
      const artists = await spotify.getRelatedArtists(artistID, token);
      chai.assert.equal(artists, null);
    });
  });
});

describe('App', () => {
  describe('GET /search', () => {
    it('should get multiple artists given a search value', (done) => {
      const artist = 'flor';
      chai
        .request(app)
        .get(`/search/${artist}`)
        .end((err, res) => {
          chai.assert.equal(res.status, 200);
          chai.assert.typeOf(res.body, 'object');
          chai.assert.equal(res.body.artists.length, 20);
          done();
        });
    });
    it('should get an object with an empty list given a non existing artist', (done) => {
      const artist = 'aksdghjkasghadjksghjklasdbgnjksdabgasdghjkasdhgeuf';
      chai
        .request(app)
        .get(`/search/${artist}`)
        .end((err, res) => {
          chai.assert.equal(res.status, 404);
          done();
        });
    });
  });
  describe('GET /related-artists', () => {
    it('should get related artists given an artist ID', (done) => {
      const artistID = '3WrFJ7ztbogyGnTHbHJFl2';
      chai
        .request(app)
        .get(`/related-artists/${artistID}`)
        .end((err, res) => {
          chai.assert.equal(res.status, 200);
          chai.assert.typeOf(res.body, 'object');
          chai.assert.equal(res.body.related_artists.length, 20);
          done();
        });
    });
    it('should not get any related artists given a non existing artist ID', (done) => {
      const artistID = 'klasdghjkasdlghjkalsdghjuiahweiguahsgjikdagjasdg';
      chai
        .request(app)
        .get(`/related-artists/${artistID}`)
        .end((err, res) => {
          chai.assert.equal(res.status, 400);
          done();
        });
    });
  });
  describe('GET with cache', () => {
    it('should get the search data from the cache', (done) => {
      const artistID = 'test';
      const url = 'redis://localhost:6379';
      const mockRedisConnection = new RedisConnection(redisMock, url);
      const mockObject = {
        source: 'cache',
        artist: {
          id: 'zzz',
          name: 'qqq',
        },
        related_artists: [
          {
            id: 'abc',
            name: 'def',
          },
        ],
      };

      app.set('cache', mockRedisConnection);
      mockRedisConnection.connectApp(app);
      mockRedisConnection.client.flushdb();
      mockRedisConnection.setex('test', 3600, mockObject);

      chai
        .request(app)
        .get(`/search/${artistID}`)
        .end((err, res) => {
          chai.assert.equal(res.status, 200);
          chai.assert.deepEqual(res.body, mockObject);
          done();
        });
    });
    it('should get the related artist from the cache', (done) => {
      const artistID = 'test';
      const url = 'redis://localhost:6379';
      const mockRedisConnection = new RedisConnection(redisMock, url);
      const mockObject = {
        source: 'cache',
        related_artists: [
          {
            id: 'abc',
            name: 'def',
          },
        ],
      };

      app.set('cache', mockRedisConnection);
      mockRedisConnection.connectApp(app);
      mockRedisConnection.client.flushdb();
      mockRedisConnection.setex('test', 3600, mockObject);

      chai
        .request(app)
        .get(`/related-artists/${artistID}`)
        .end((err, res) => {
          chai.assert.equal(res.status, 200);
          chai.assert.deepEqual(res.body, mockObject);
          done();
        });
    });
  });
});
