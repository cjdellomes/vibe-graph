const express = require('express');
const spotify = require('../spotifyController');

const router = express.Router();

router.get('/:searchValue', async (req, res) => {
  const cacheConnected = req.app.get('cacheConnected');
  const cache = req.app.get('cache');
  const { searchValue } = req.params;

  if (cacheConnected) {
    const cacheData = await cache.get(searchValue);

    if (cacheData != null) {
      res.send(cacheData);
      return;
    }
  }

  const token = await spotify.getToken();
  const artist = await spotify.getFirstArtist(searchValue, token);

  if (artist == null) {
    res.status(404);
    res.send('Not Found');
    return;
  }

  const artistID = artist.id;
  const relatedArtists = await spotify.getRelatedArtists(artistID, token);

  if (cacheConnected) {
    cache.setex(
      searchValue,
      3600,
      {
        source: 'cache',
        artist,
        related_artists: relatedArtists,
      },
    );
  }

  res.send({
    source: 'api',
    artist,
    related_artists: relatedArtists,
  });
});

module.exports = router;
