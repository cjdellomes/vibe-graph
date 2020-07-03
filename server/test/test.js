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
    const url = 'http://localhost:6379';
    const mockConnection = new RedisConnection(redisMock, url);
    chai.assert.notEqual(mockConnection.client, null);
  });
  it('should create a null client connection given a null redis package', () => {
    const url = 'http://localhost:6379';
    const mockConnection = new RedisConnection(null, url);
    chai.assert.equal(mockConnection.client, null);
  });
  it('should set the cache connected status in the app settings to true', () => {
    const mockApp = express();
    mockApp.set('cacheConnected', false);

    const url = 'http://localhost:6379';
    const mockConnection = new RedisConnection(redisMock, url);

    mockConnection.connectApp(mockApp);

    chai.assert.equal(mockApp.settings.cacheConnected, true);
  });
  it('should set the cache connected status in the app settings to false when the client is null', () => {
    const mockApp = express();
    mockApp.set('cacheConnected', false);

    const url = 'http://localhost:6379';
    const mockConnection = new RedisConnection(null, url);

    mockConnection.connectApp(mockApp);

    chai.assert.equal(mockApp.settings.cacheConnected, false);
  });
  it('should get the existing key value pair', async () => {
    const url = 'http://localhost:6379';
    const mockConnection = new RedisConnection(redisMock, url);
    const mockObject = {
      abc: 'blah',
    };

    mockConnection.client.flushdb();
    mockConnection.client.set('test', JSON.stringify(mockObject));

    const val = await mockConnection.get('test');

    chai.assert.deepEqual(mockObject, val);
  });
  it('should return null when getting non existing key value pair', async () => {
    const url = 'http://localhost:6379';
    const mockConnection = new RedisConnection(redisMock, url);

    mockConnection.client.flushdb();
    const val = await mockConnection.get('test');

    chai.assert.equal(val, null);
  });
  it('should return null when the client is not connected', async () => {
    const url = 'http://localhost:6379';
    const mockConnection = new RedisConnection(null, url);

    const val = await mockConnection.get('test');

    chai.assert.equal(val, null);
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
    it('should get a single artist and multiple related artists given an artist name', (done) => {
      const artist = 'clairo';
      chai
        .request(app)
        .get(`/search/${artist}`)
        .end((err, res) => {
          chai.assert.equal(res.status, 200);
          chai.assert.typeOf(res.body, 'object');
          chai.assert.equal(res.body.artist.id, '3l0CmX0FuQjFxr8SK7Vqag');
          chai.assert.equal(res.body.related_artists.length, 20);
          done();
        });
    });
    it('should not get a single artist nor related artists given a non existing artist name', (done) => {
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
});
