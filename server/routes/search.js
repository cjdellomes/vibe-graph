const express = require('express');
const fetch = require('node-fetch');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config')[env];

const clientID = config.clientID;
const clientSecret = config.clientSecret;

let router = express.Router();

function getToken(clientID, clientSecret) {
  const clientStr = clientID + ':' + clientSecret;
  return fetch(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (
          new Buffer.alloc(clientStr.length, clientStr).toString('base64'))
      },
      body: 'grant_type=client_credentials'
    }
  )
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    const token = json.access_token;
    return token;
  })
  .catch((error) => {
    console.error('There was an error in the token fetch operation: ', error);
  });
}

function getArtistID(artistName, token) {
  return fetch(
    'https://api.spotify.com/v1/search?q=' + artistName + '&type=artist',
    {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }
  )
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    const artists = json.artists;
    const items = artists.items;
    const artistID = items[0].id;

    return artistID;
  })
  .catch((error) => {
    console.error(
      'There was an error in the artist ID fetch operation: ', error);
  });
}

function getRelatedArtists(artistID, token) {
  return fetch(
    'https://api.spotify.com/v1/artists/' + artistID + '/related-artists',
    {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }
  )
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    const relatedArtists = json.artists;
    return relatedArtists;
  })
  .catch((error) => {
    console.error(
      'There was an error in the related artists fetch operation: ', error);
  });
}

router.param('artist', async function(req, res, next, artistName) {
  const token = await getToken(clientID, clientSecret);
  const artistID = await getArtistID(artistName, token);
  const relatedArtists = await getRelatedArtists(artistID, token);

  req.relatedArtists = relatedArtists;
  return next();
});

/* GET home page. */
router.get('/:artist', function(req, res, next) {
  res.send({
    'relatedArtists': req.relatedArtists
  });
});

module.exports = router;