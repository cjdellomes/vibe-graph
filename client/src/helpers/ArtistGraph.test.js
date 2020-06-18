import {
  getArtistImageUrlOrDefault,
  getRelatedArtistEdge,
  getArtistNode,
  addArtistToGraph,
} from './ArtistGraph';

describe('getArtistImageUrlOrDefault', () => {
  it('gets the last image in a given artist object', () => {
    const mockArtist = {
      images: [
        {
          height: 640,
          url: 'test.png',
          width: 640,
        },
        {
          height: 320,
          url: 'test2.png',
          width: 320,
        },
      ],
    };
    expect(getArtistImageUrlOrDefault(mockArtist, '')).toBe('test2.png');
  });

  it('gets an empty string from artist object with empty image list', () => {
    const mockArtist = {
      images: [],
    };
    expect(getArtistImageUrlOrDefault(mockArtist, '')).toBe('');
  });
});

describe('getRelatedArtistEdge', () => {
  it('gets a related artist edge given artist node ID and related artist node ID', () => {
    const mockRelatedArtistEdge = {
      id: 'abc:def',
      from: 'abc',
      to: 'def',
    };
    expect(getRelatedArtistEdge('abc', 'def')).toMatchObject(
      mockRelatedArtistEdge,
    );
  });

  it('gets a null object given a null artist node ID', () => {
    expect(getRelatedArtistEdge(null, 'def')).toBe(null);
  });

  it('gets a null object given a null related artist node ID ', () => {
    expect(getRelatedArtistEdge('abc', null)).toBe(null);
  });

  it('gets a null object given an undefined artist node ID', () => {
    expect(getRelatedArtistEdge(undefined, 'def')).toBe(null);
  });

  it('gets a null object given an undefined related artist node ID ', () => {
    expect(getRelatedArtistEdge('abc', undefined)).toBe(null);
  });

  it('gets a null object given an empty string artist node ID', () => {
    expect(getRelatedArtistEdge('', 'def')).toBe(null);
  });

  it('gets a null object given an empty string related artist node ID ', () => {
    expect(getRelatedArtistEdge('abc', '')).toBe(null);
  });
});

describe('getArtistNode', () => {
  it('gets an artist node given an artist object', () => {
    const mockArtist = {
      id: 'a1b2c3',
      name: 'def',
      images: [
        {
          height: 640,
          url: 'test.png',
          weight: 640,
        },
      ],
    };

    const mockArtistNode = {
      id: mockArtist.id,
      label: mockArtist.name,
      title: mockArtist.name,
      shape: 'circularImage',
      image: mockArtist.images[0].url,
    };

    expect(getArtistNode(mockArtist)).toMatchObject(mockArtistNode);
  });

  it('gets a null object given a null object', () => {
    expect(getArtistNode(null)).toBe(null);
  });

  it('gets a null object given an undefined object', () => {
    expect(getArtistNode(undefined)).toBe(null);
  });
});

describe('addArtistToGraph', () => {
  it('does nothing when the graph is null', () => {
    const mockGraph = null;
    const mockArtist = {
      id: 'abc',
      name: 'def',
      images: [
        {
          height: 320,
          url: 'xyz',
          width: 320,
        },
      ],
    };
    addArtistToGraph(null, mockArtist);
    expect(mockGraph).toBe(null);
  });

  it('does not change the graph when given a null artist', () => {
    const mockGraph = {
      nodes: [],
      edges: [],
      nodeSet: new Set(),
      edgeSet: new Set(),
    };
    addArtistToGraph(mockGraph, null);
    expect(mockGraph.nodes.length).toBe(0);
    expect(mockGraph.edges.length).toBe(0);
    expect(mockGraph.nodeSet.size).toBe(0);
    expect(mockGraph.edgeSet.size).toBe(0);
  });

  it('adds the given artist to the given empty graph', () => {
    const mockGraph = {
      nodes: [],
      edges: [],
      nodeSet: new Set(),
      edgeSet: new Set(),
    };
    const mockArtist = {
      id: 'abc',
      name: 'def',
      images: [
        {
          height: 320,
          url: 'xyz',
          width: 320,
        },
      ],
    };

    addArtistToGraph(mockGraph, mockArtist);
    expect(mockGraph.nodes.length).toBe(1);
    expect(mockGraph.edges.length).toBe(0);
    expect(mockGraph.nodeSet.size).toBe(1);
    expect(mockGraph.edgeSet.size).toBe(0);
    expect(mockGraph.nodes[0].id).toBe('abc');
    expect(mockGraph.nodes[0].title).toBe('def');
    expect(mockGraph.nodes[0].image).toBe('xyz');
    expect(mockGraph.nodeSet.has('abc'));
  });

  it('does not add the already existing artist to the given graph', () => {
    const mockGraph = {
      nodes: [
        {
          id: 'abc',
          label: 'def',
          title: 'def',
          shape: 'circularImage',
          image: 'xyz',
        },
      ],
      edges: [],
      nodeSet: new Set(['abc']),
      edgeSet: new Set(),
    };
    const mockArtist = {
      id: 'abc',
      name: 'def',
      images: [
        {
          height: 320,
          url: 'xyz',
          width: 320,
        },
      ],
    };

    addArtistToGraph(mockGraph, mockArtist);
    expect(mockGraph.nodes.length).toBe(1);
    expect(mockGraph.edges.length).toBe(0);
    expect(mockGraph.nodeSet.size).toBe(1);
    expect(mockGraph.edgeSet.size).toBe(0);
    expect(mockGraph.nodes[0].id).toBe('abc');
    expect(mockGraph.nodes[0].title).toBe('def');
    expect(mockGraph.nodes[0].image).toBe('xyz');
  });
});
