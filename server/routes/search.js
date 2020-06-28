const express = require('express');
const spotify = require('../spotifyController');

const router = express.Router();

const checkCache = (req, res, next) => {
  if (!req.app.get('cacheConnected')) {
    next();
    return;
  }

  const cache = req.app.get('cache');
  const { searchValue } = req.params;

  cache.get(searchValue, (err, data) => {
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

  if (req.app.get('cacheConnected')) {
    const cache = req.app.get('cache');
    cache.setex(
      searchValue,
      3600,
      JSON.stringify({
        source: 'cache',
        artist,
        related_artists: relatedArtists,
      }),
    );
  }

  res.send({
    source: 'api',
    artist,
    related_artists: relatedArtists,
  });
});

module.exports = router;
