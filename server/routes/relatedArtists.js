const express = require('express');
const spotify = require('../spotifyController');
const redisClient = require('../redis-client');

const router = express.Router();

const checkCache = (req, res, next) => {
  const { artistID } = req.params;

  redisClient.get(artistID, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data != null) {
      res.send(JSON.parse(data));
    } else {
      next();
    }
  });
};

router.get('/:artistID', checkCache, async (req, res) => {
  const { artistID } = req.params;

  const token = await spotify.getToken();
  const relatedArtists = await spotify.getRelatedArtists(artistID, token);

  if (relatedArtists == null) {
    res.status(400);
    res.send('Invalid ID');
    return;
  }

  redisClient.setex(
    artistID,
    3600,
    JSON.stringify({
      related_artists: relatedArtists,
    }),
  );

  res.send({
    related_artists: relatedArtists,
  });
});

module.exports = router;
