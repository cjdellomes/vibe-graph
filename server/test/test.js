const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app')

chai.use(chaiHttp);

describe('App', () => {
    describe('GET /', () => {
        it('should get a single artist and multiple related artists', (done) => {
            const artist = 'clairo';
            chai.request(app)
                .get(`/search/${artist}`)
                .end((err, res) => {
                    chai.assert.equal(res.status, 200);
                    chai.assert.typeOf(res.body, 'object');
                    chai.assert.equal(res.body.artist.id, '3l0CmX0FuQjFxr8SK7Vqag');
                    chai.assert.equal(res.body.related_artists.length, 20);
                    done();
                });
        });
        it('should not get a single artist nor related artists', (done) => {
            const artist = 'aksdghjkasghadjksghjklasdbgnjksdabgasdghjkasdhgeuf';
            chai.request(app)
                .get(`/search/${artist}`)
                .end((err, res) => {
                    chai.assert.equal(res.status, 404);
                    done();
                });
        })
    });
});