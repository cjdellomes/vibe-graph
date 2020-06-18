const getArtistImageUrlOrDefault = (artist, defaultVal) => {
  if (artist.images.length > 0) {
    return artist.images[artist.images.length - 1].url;
  }
  return defaultVal;
};

const getRelatedArtistEdge = (artistNodeID, relatedArtistNodeID) => {
  if (
    artistNodeID == null
    || relatedArtistNodeID == null
    || artistNodeID === ''
    || relatedArtistNodeID === ''
  ) {
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

const addArtistToGraph = (graph, artist) => {
  if (graph == null || artist == null) {
    return;
  }

  const { nodes, nodeSet } = graph;

  const artistNode = getArtistNode(artist);

  if (!nodeSet.has(artistNode.id)) {
    nodeSet.add(artistNode.id);
    nodes.push(artistNode);
  }
};

const addRelatedArtistsToGraph = (graph, artistNodeID, relatedArtists) => {
  if (
    graph == null
    || artistNodeID == null
    || artistNodeID === ''
    || relatedArtists == null
  ) {
    return;
  }

  const {
    nodes, edges, nodeSet, edgeSet,
  } = graph;

  for (let i = 0; i < relatedArtists.length; i += 1) {
    const relatedArtist = relatedArtists[i];

    const relatedArtistNode = getArtistNode(relatedArtist);
    const relatedArtistEdge = getRelatedArtistEdge(
      artistNodeID,
      relatedArtistNode.id,
    );

    if (!nodeSet.has(relatedArtistNode.id)) {
      nodeSet.add(relatedArtistNode.id);
      nodes.push(relatedArtistNode);
    }
    if (!edgeSet.has(relatedArtistEdge.id)) {
      edgeSet.add(relatedArtistEdge.id);
      edges.push(relatedArtistEdge);
    }
  }
};

module.exports = {
  getArtistImageUrlOrDefault,
  getRelatedArtistEdge,
  getArtistNode,
  addArtistToGraph,
  addRelatedArtistsToGraph,
};
