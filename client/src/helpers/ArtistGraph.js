class ArtistGraphHelper {
  static getArtistImageUrlOrDefault(artist, defaultVal) {
    if (artist.images.length > 0) {
      return artist.images[artist.images.length - 1].url;
    }
    return defaultVal;
  }

  static getRelatedArtistEdge(artistNodeID, relatedArtistNodeID) {
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
  }

  static getArtistNode(artist) {
    if (artist == null) {
      return null;
    }

    const artistImageUrl = ArtistGraphHelper.getArtistImageUrlOrDefault(artist, '');

    const artistNode = {
      id: artist.id,
      label: artist.name,
      title: artist.name,
      shape: 'circularImage',
      image: artistImageUrl,
    };

    return artistNode;
  }

  static addArtistToGraph(graph, artist) {
    if (graph == null || artist == null) {
      return;
    }

    const { nodes, nodeSet } = graph;

    const artistNode = ArtistGraphHelper.getArtistNode(artist);

    if (!nodeSet.has(artistNode.id)) {
      nodeSet.add(artistNode.id);
      nodes.push(artistNode);
    }
  }

  static addRelatedArtistsToGraph(graph, artistNodeID, relatedArtists) {
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

      const relatedArtistNode = ArtistGraphHelper.getArtistNode(relatedArtist);
      const relatedArtistEdge = ArtistGraphHelper.getRelatedArtistEdge(
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
  }

  static fetchRelatedArtists(artistID) {
    return fetch(`/related-artists/${encodeURIComponent(artistID)}`)
      .then((res) => res.json())
      .then(
        (result) => result.related_artists,
        (error) => {
          console.error('error in related artist result: ', error);
        },
      )
      .catch((error) => {
        console.error('error in fetching related artists: ', error);
      });
  }

  static fetchArtistSearch(artistName) {
    return fetch(`/search/${encodeURIComponent(artistName)}`)
      .then((res) => res.json())
      .then(
        (result) => result,
        (error) => {
          console.error('error in artist search result: ', error);
        },
      )
      .catch((error) => {
        console.error('error in fetching artist search results: ', error);
      });
  }
}

export default ArtistGraphHelper;
