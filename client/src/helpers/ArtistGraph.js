const getArtistImageUrlOrDefault = (artist, defaultVal) => {
  if (artist.images.length > 0) {
    return artist.images[artist.images.length - 1].url;
  }
  return defaultVal;
};

const getRelatedArtistEdge = (artistNodeID, relatedArtistNodeID) => {
  if (artistNodeID == null || relatedArtistNodeID == null) {
    return null;
  }

  const relatedArtistEdge = {
    id: `${artistNodeID}:${relatedArtistNodeID}`,
    from: artistNodeID,
    to: relatedArtistNodeID,
  };

  return relatedArtistEdge;
};

const getArtistNode = (artist) => {
  if (artist == null) {
    return null;
  }

  const artistImageUrl = getArtistImageUrlOrDefault(artist, '');

  const artistNode = {
    id: artist.id,
    label: artist.name,
    title: artist.name,
    shape: 'circularImage',
    image: artistImageUrl,
  };

  return artistNode;
};

module.exports = {
  getArtistImageUrlOrDefault,
  getRelatedArtistEdge,
  getArtistNode,
};
