const express = require('express');
const spotify = require('../spotifyController');

const router = express.Router();

router.get('/:searchValue', async (req, res) => {
  const cacheConnected = req.app.get('cacheConnected');
  const cache = req.app.get('cache');

  // casing does not matter when using Spotify Web API search endpoint
  // so, we lower case the search value to consolidate the cache key value pairs
  // otherwise, 2 search strings with different casings would be different keys
  // with the same associated value, thus storing duplicate data unnecessarily
  const searchValue = req.params.searchValue.toLowerCase();

  if (cacheConnected) {
    const cacheData = await cache.get(searchValue);

    if (cacheData != null) {
      res.status(200);
      res.send(cacheData);
      return;
    }
  }

  const token = await spotify.getToken();
  const artists = await spotify.searchArtist(searchValue, token);

  if (artists.length === 0) {
    res.status(404);
    res.send('Not Found');
    return;
  }

  if (cacheConnected) {
    cache.setex(
      searchValue,
      3600,
      {
        source: 'cache',
        artists,
      },
    );
  }

  res.status(200);
  res.send({
    source: 'api',
    artists,
  });
});

module.exports = router;
