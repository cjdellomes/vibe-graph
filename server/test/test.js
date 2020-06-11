const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const spotify = require('../spotifyController');

chai.use(chaiHttp);

describe('SpotifyController', () => {
  it('should get a token', async () => {
    const token = await spotify.getToken();
    chai.assert.typeOf(token, 'string');
  });
  it('should get a list of artists matching the given artist name', async () => {
    const artistName = 'the beatles';
    const token = await spotify.getToken();
    const artists = await spotify.searchArtist(artistName, token);
    chai.assert.notEqual(artists, null);
    chai.assert.isArray(artists);
    chai.assert.equal(artists.length, 20);
    chai.assert.equal(artists[0].id, '3WrFJ7ztbogyGnTHbHJFl2');
  });
  it('should get an empty list of artists given a nonexisting artist name', async () => {
    const artistName = 'hgjaghjkadghjkaghjkghaghdghjkaghjkaglg';
    const token = await spotify.getToken();
    const artists = await spotify.searchArtist(artistName, token);
    chai.assert.notEqual(artists, null);
    chai.assert.isArray(artists);
    chai.assert.equal(artists.length, 0);
  });
});

describe('App', () => {
  describe('GET /', () => {
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
