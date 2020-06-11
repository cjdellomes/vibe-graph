const fetch = require('node-fetch');

const env = process.env.NODE_ENV || 'development';

class SpotifyController {
  static getToken() {
    let clientID;
    let clientSecret;
    if (env === 'development') {
      // eslint-disable-next-line global-require
      const config = require('../config')[env];
      clientID = config.clientID;
      clientSecret = config.clientSecret;
    } else {
      clientID = process.env.CLIENT_ID;
      clientSecret = process.env.CLIENT_SECRET;
    }

    const clientStr = `${clientID}:${clientSecret}`;
    return fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${
          // eslint-disable-next-line new-cap
          new Buffer.alloc(clientStr.length, clientStr).toString('base64')
        }`,
      },
      body: 'grant_type=client_credentials',
    })
      .then((res) => res.json())
      .then((json) => {
        const token = json.access_token;
        return token;
      })
      .catch((error) => {
        console.error(
          'There was an error in the token fetch operation: ',
          error,
        );
      });
  }

  static searchArtist(artistName, token) {
    const encodedArtistName = encodeURIComponent(artistName);
    return fetch(
      `https://api.spotify.com/v1/search?q=${encodedArtistName}&type=artist`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((res) => res.json())
      .then((json) => {
        const { artists } = json;
        const { items } = artists;

        return items;
      })
      .catch((error) => {
        console.error(
          'There was an error in the artist search fetch operation: ',
          error,
        );
      });
  }

  static getFirstArtist(artistName, token) {
    const encodedArtistName = encodeURIComponent(artistName);
    return fetch(
      `https://api.spotify.com/v1/search?q=${encodedArtistName}&type=artist&limit=1`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((res) => res.json())
      .then((json) => {
        const { artists } = json;
        const { items } = artists;
        const artist = items.length > 0 ? items[0] : null;

        return artist;
      })
      .catch((error) => {
        console.error(
          'There was an error in the first artist fetch operation: ',
          error,
        );
      });
  }

  static getArtist(artistID, token) {
    return fetch(`https://api.spotify.com/v1/artists/${artistID}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error != null) {
          return null;
        }
        return json;
      })
      .catch((error) => {
        console.error(
          'There was an error in the artist fetch operation: ',
          error,
        );
      });
  }

  static getRelatedArtists(artistID, token) {
    return fetch(
      `https://api.spotify.com/v1/artists/${artistID}/related-artists`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((res) => res.json())
      .then((json) => {
        const relatedArtists = json.artists;
        return relatedArtists;
      })
      .catch((error) => {
        console.error(
          'There was an error in the related artists fetch operation: ',
          error,
        );
      });
  }
}

module.exports = SpotifyController;
