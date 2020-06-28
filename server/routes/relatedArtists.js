const express = require('express');
const spotify = require('../spotifyController');

const router = express.Router();

const checkCache = (req, res, next) => {
  if (!req.app.get('cacheConnected')) {
    next();
    return;
  }

  const cache = req.app.get('cache');
  const { artistID } = req.params;

  cache.get(artistID, (err, data) => {
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

  if (req.app.get('cacheConnected')) {
    const cache = req.app.get('cache');
    cache.setex(
      artistID,
      3600,
      JSON.stringify({
        source: 'cache',
        related_artists: relatedArtists,
      }),
    );
  }

  res.send({
    source: 'api',
    related_artists: relatedArtists,
  });
});

module.exports = router;
