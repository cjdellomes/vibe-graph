import { enableFetchMocks } from 'jest-fetch-mock';
import ArtistGraphHelper from './ArtistGraph';

enableFetchMocks();

const {
  getArtistImageUrlOrDefault,
  getRelatedArtistEdge,
  getArtistNode,
  addArtistToGraph,
  addRelatedArtistsToGraph,
  fetchRelatedArtists,
  fetchArtistSearch,
} = ArtistGraphHelper;

describe('ArtistGraphHelper', () => {
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
      expect(getArtistImageUrlOrDefault(mockArtist, '')).toBe('test.png');
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

  describe('addRelatedArtistsToGraph', () => {
    it('does nothing when the graph is null', () => {
      const mockGraph = null;
      addRelatedArtistsToGraph(null, 'abc', []);
      expect(mockGraph).toBe(null);
    });

    it('adds the related artists to the graph', () => {
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
      const mockRelatedArtists = [
        {
          id: 'ijk',
          name: 'uvw',
          images: [
            {
              height: 320,
              url: 'qrs',
              width: 320,
            },
          ],
        },
        {
          id: 'adhgjkasg',
          name: 'qptiasdg',
          images: [
            {
              height: 320,
              url: 'adghjkadghag',
              width: 320,
            },
          ],
        },
      ];

      addRelatedArtistsToGraph(mockGraph, 'abc', mockRelatedArtists);
      expect(mockGraph.nodes.length).toBe(3);
      expect(mockGraph.edges.length).toBe(2);
      expect(mockGraph.nodeSet.size).toBe(3);
      expect(mockGraph.edgeSet.size).toBe(2);
      expect(mockGraph.nodes[0].id).toBe('abc');
      expect(mockGraph.nodeSet.has(mockRelatedArtists[0].id));
      expect(mockGraph.nodeSet.has(mockRelatedArtists[1].id));
      expect(mockGraph.edgeSet.has('abc:ijk'));
      expect(mockGraph.edgeSet.has('abc:adhgjkasg'));
    });

    it('does not add related artist nodes already in the graph', () => {
      const mockGraph = {
        nodes: [
          {
            id: 'abc',
            label: 'def',
            title: 'def',
            shape: 'circularImage',
            image: 'xyz',
          },
          {
            id: 'gasdgasdgasdg',
            label: 'asdhgashah',
            title: 'asdhgashah',
            shape: 'circularImage',
            image: 'hadfhadfhdsh',
          },
        ],
        edges: [],
        nodeSet: new Set(['abc', 'gasdgasdgasdg']),
        edgeSet: new Set(),
      };
      const mockRelatedArtists = [
        {
          id: 'gasdgasdgasdg',
          name: 'asdhgashah',
          images: [
            {
              height: 320,
              url: 'hadfhadfhdsh',
              width: 320,
            },
          ],
        },
      ];

      addRelatedArtistsToGraph(mockGraph, 'abc', mockRelatedArtists);
      expect(mockGraph.nodes.length).toBe(2);
      expect(mockGraph.nodeSet.size).toBe(2);
      expect(mockGraph.nodes[0].id).toBe('abc');
      expect(mockGraph.nodes[1].id).toBe('gasdgasdgasdg');
      expect(mockGraph.nodeSet.has(mockRelatedArtists[0].id));
    });

    it('does not add related artist edges already in the graph', () => {
      const mockGraph = {
        nodes: [
          {
            id: 'abc',
            label: 'def',
            title: 'def',
            shape: 'circularImage',
            image: 'xyz',
          },
          {
            id: 'gasdgasdgasdg',
            label: 'asdhgashah',
            title: 'asdhgashah',
            shape: 'circularImage',
            image: 'hadfhadfhdsh',
          },
        ],
        edges: [
          {
            id: 'abc:gasdgasdgasdg',
            from: 'abc',
            to: 'gasdgasdgasdg',
          },
        ],
        nodeSet: new Set(['abc', 'gasdgasdgasdg']),
        edgeSet: new Set(['abc:gasdgasdgasdg']),
      };
      const mockRelatedArtists = [
        {
          id: 'gasdgasdgasdg',
          name: 'asdhgashah',
          images: [
            {
              height: 320,
              url: 'hadfhadfhdsh',
              width: 320,
            },
          ],
        },
      ];

      addRelatedArtistsToGraph(mockGraph, 'abc', mockRelatedArtists);
      expect(mockGraph.edges.length).toBe(1);
      expect(mockGraph.edgeSet.size).toBe(1);
      expect(mockGraph.edges[0].id).toBe('abc:gasdgasdgasdg');
      expect(mockGraph.edgeSet.has('abc:gasdgasdgasdg'));
    });
  });

  describe('fetchRelatedArtists', () => {
    beforeEach(() => {
      fetch.resetMocks();
    });

    it('should fetch a null object given an erroneous artist search fetch response', async () => {
      fetch.mockResponseOnce(null);

      expect(await fetchArtistSearch('aaa')).toEqual(null);
    });

    it('should fetch the artist search results', async () => {
      const mockArtists = [
        {
          id: 'ddd',
          name: 'aaa',
          images: [
            {
              height: 320,
              url: 'fff',
              width: 320,
            },
          ],
        },
        {
          id: 'ggg',
          name: 'a',
          images: [
            {
              height: 320,
              url: 'iii',
              width: 320,
            },
          ],
        },
      ];

      fetch.mockResponseOnce(JSON.stringify({
        artists: mockArtists,
      }));

      expect(await fetchArtistSearch('aaa')).toEqual(expect.arrayContaining(mockArtists));
    });

    it('should fetch a null object given an erroneous related artists fetch response', async () => {
      fetch.mockResponseOnce(null);

      expect(await fetchRelatedArtists('aaa')).toEqual(null);
    });

    it('should fetch the related artists', async () => {
      const mockRelatedArtists = [
        {
          id: 'ddd',
          name: 'eee',
          images: [
            {
              height: 320,
              url: 'fff',
              width: 320,
            },
          ],
        },
        {
          id: 'ggg',
          name: 'hhh',
          images: [
            {
              height: 320,
              url: 'iii',
              width: 320,
            },
          ],
        },
      ];

      fetch.mockResponseOnce(JSON.stringify({
        related_artists: mockRelatedArtists,
      }));

      expect(await fetchRelatedArtists('aaa')).toEqual(expect.arrayContaining(mockRelatedArtists));
    });
  });
});
