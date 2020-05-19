const fetch = require('node-fetch');
const env = process.env.NODE_ENV || 'development';
const config = require('../config')[env];

class SpotifyController {
    static getToken = function() {
        const clientID = config.clientID;
        const clientSecret = config.clientSecret;
        const clientStr = clientID + ':' + clientSecret;
        return fetch(
            'https://accounts.spotify.com/api/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (
                    new Buffer.alloc(clientStr.length, clientStr).toString('base64'))
                },
                body: 'grant_type=client_credentials'
            }
        )
        .then(res => res.json())
        .then((json) => {
            const token = json.access_token;
            return token;
        })
        .catch((error) => {
            console.error('There was an error in the token fetch operation: ', error);
        });
    }
      
    static getArtist = function(artistName, token) {
        return fetch(
            'https://api.spotify.com/v1/search?q=' + artistName + '&type=artist&limit=1',
          {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + token
            }
          }
        )
        .then(res => res.json())
        .then((json) => {
            const artists = json.artists;
            const items = artists.items;
            const artist = items[0];
      
            return artist;
        })
        .catch((error) => {
            console.error(
                'There was an error in the artist ID fetch operation: ', error);
        });
    }
      
    static getRelatedArtists = function(artistID, token) {
        return fetch(
            'https://api.spotify.com/v1/artists/' + artistID + '/related-artists',
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }
        )
        .then(res => res.json())
        .then((json) => {
            const relatedArtists = json.artists;
            return relatedArtists;
        })
        .catch((error) => {
            console.error(
                'There was an error in the related artists fetch operation: ', error);
        });
    }

}

module.exports = SpotifyController;