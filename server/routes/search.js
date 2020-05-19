const express = require('express');
const spotify = require('../spotifyController');

let router = express.Router();

router.param('artist', async function (req, res, next, artistName) {
  const token = await spotify.getToken();
  const artist = await spotify.getArtist(artistName, token);
  const artistID = artist.id;
  const relatedArtists = await spotify.getRelatedArtists(artistID, token);

  req.artist = artist;
  req.relatedArtists = relatedArtists;
  return next();
});

router.get('/:artist', function (req, res, next) {
  res.send({
    'artist' : req.artist,
    'related_artists': req.relatedArtists
  });
});

module.exports = router;