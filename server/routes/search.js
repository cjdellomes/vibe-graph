const express = require('express');
const spotify = require('../spotifyController');
const redisClient = require('../redis-client');

const router = express.Router();

const checkCache = (req, res, next) => {
  const { searchValue } = req.params;

  redisClient.get(searchValue, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    if (data != null) {
      res.send(JSON.parse(data));
    } else {
      next();
    }
  });
};

router.get('/:searchValue', checkCache, async (req, res) => {
  const { searchValue } = req.params;
  const token = await spotify.getToken();
  const artist = await spotify.getFirstArtist(searchValue, token);

  if (artist == null) {
    res.status(404);
    res.send('Not Found');
    return;
  }

  const artistID = artist.id;
  const relatedArtists = await spotify.getRelatedArtists(artistID, token);

  redisClient.setex(
    searchValue,
    3600,
    JSON.stringify({
      artist,
      related_artists: relatedArtists,
    }),
  );

  console.log({
    artist,
    related_artists: relatedArtists,
  });

  res.send({
    artist,
    related_artists: relatedArtists,
  });
});

module.exports = router;
