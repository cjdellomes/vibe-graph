const express = require('express');
const spotify = require('../spotifyController');

const router = express.Router();

router.param('artist', async (req, res, next, artistName) => {
  const token = await spotify.getToken();
  const artist = await spotify.getFirstArtist(artistName, token);
  req.artist = artist;

  if (artist == null) {
    req.relatedArtists = null;
    return next();
  }

  const artistID = artist.id;
  const relatedArtists = await spotify.getRelatedArtists(artistID, token);
  req.relatedArtists = relatedArtists;

  return next();
});

router.get('/:artist', (req, res) => {
  console.log(res);
  if (req.artist == null) {
    res.status(404);
    res.send('Not Found');
    console.log(res);
    return;
  }

  console.log(res);
  res.send({
    artist: req.artist,
    related_artists: req.relatedArtists,
  });
  console.log(res);
});

module.exports = router;
