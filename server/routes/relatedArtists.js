const express = require('express');
const spotify = require('../spotifyController');
const redisClient = require('../redis-client');

const router = express.Router();

router.use((req, res, next) => {
  console.log('here');
  const { artistID } = req.params;

  redisClient.get(artistID, (err, data) => {
    if (err) {
      console.error(err);
    }

    if (data != null) {
      res.send(data);
    } else {
      next();
    }
  });
});

router.param('artistID', async (req, res, next, artistID) => {
  const token = await spotify.getToken();
  const relatedArtists = await spotify.getRelatedArtists(artistID, token);

  if (relatedArtists == null) {
    req.relatedArtists = null;
    return next();
  }

  req.relatedArtists = relatedArtists;

  redisClient.setex(
    artistID,
    3600,
    JSON.stringify({
      related_artists: req.relatedArtists,
    }),
  );

  return next();
});

router.get('/:artistID', (req, res) => {
  if (req.relatedArtists == null) {
    res.status(400);
    res.send('Invalid ID');
    return;
  }

  res.send({
    related_artists: req.relatedArtists,
  });
});

module.exports = router;
