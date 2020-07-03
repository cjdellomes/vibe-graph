const express = require('express');
const spotify = require('../spotifyController');

const router = express.Router();

router.get('/:artistID', async (req, res) => {
  const cacheConnected = req.app.get('cacheConnected');
  const cache = req.app.get('cache');
  const { artistID } = req.params;

  if (cacheConnected) {
    const cacheData = await cache.get(artistID);

    if (cacheData != null) {
      res.status(200);
      res.send(cacheData);
      return;
    }
  }

  const token = await spotify.getToken();
  const relatedArtists = await spotify.getRelatedArtists(artistID, token);

  if (relatedArtists == null) {
    res.status(400);
    res.send('Invalid ID');
    return;
  }

  if (cacheConnected) {
    cache.setex(
      artistID,
      3600,
      {
        source: 'cache',
        related_artists: relatedArtists,
      },
    );
  }

  res.status(200);
  res.send({
    source: 'api',
    related_artists: relatedArtists,
  });
});

module.exports = router;
