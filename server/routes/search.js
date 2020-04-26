const express = require('express');
const request = require('request');
const rp = require('request-promise');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config')[env];

const clientID = config.clientID;
const clientSecret = config.clientSecret;
const clientStr = clientID + ':' + clientSecret;

const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer.alloc(clientStr.length, clientStr).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
};

let router = express.Router();

router.param('artist', function(req, res, next, artistName) {
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            const token = body.access_token;

            let options = {
                url: 'https://api.spotify.com/v1/search?q=' + artistName + '&type=artist',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };

            request.get(options, function(error, response, body) {
                if (error || response.statusCode != 200) {
                  return;
                }

                if (body.artists === undefined) {
                  return;
                }
                const artists = body.artists;
          
                let items = [];
                if (artists === undefined) {
                  return;
                }
                items = artists.items;
          
                if (items == undefined || items.length === 0) {
                  return;
                }
          
                let artistID = items[0].id;
                options.url = 'https://api.spotify.com/v1/artists/' + artistID + '/related-artists';

                request.get(options, function(error, response, body) {
                    if (error || response.statusCode != 200) {
                      return;
                    }

                    let relatedArtists = body.artists;
                    // TODO: Fix this so req actually has the relatedArtists property after all these requests
                    req.relatedArtists = relatedArtists;
                });
            });
        }
    });

    // At this point, req.relatedArtists is still set to undefined
    return next();
  });

/* GET home page. */
router.get('/:artist', function(req, res, next) {
    res.send({
        'relatedArtists': req.relatedArtists
    });
});

module.exports = router;