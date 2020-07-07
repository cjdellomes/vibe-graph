import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ArtistGraphHelper from '../helpers/ArtistGraph';
import App from './App';

jest.mock('../helpers/ArtistGraph');
configure({ adapter: new Adapter() });

describe('App', () => {
  beforeEach(() => {
    ArtistGraphHelper.mockClear();
  });

  it('initializes with the correct initial state', () => {
    const mockOptions = {
      autoResize: true,
      layout: {
        hierarchical: false,
      },
      edges: {
        width: 0.15,
        color: { inherit: 'from' },
        smooth: {
          type: 'continuous',
        },
      },
      physics: {
        enabled: true,
        repulsion: {
          centralGravity: 0.0,
          springLength: 50,
          springConstant: 0.01,
          nodeDistance: 200,
          damping: 0.09,
        },
        solver: 'repulsion',
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
      },
    };

    const component = shallow(<App />);

    expect(component.state('showModal')).toBe(false);
    expect(component.state('searchValue')).toBe('');
    expect(component.state('searchResults').length).toBe(0);
    expect(component.state('searchResultCards').length).toBe(0);
    expect(component.state('graph').nodes.length).toBe(0);
    expect(component.state('graph').edges.length).toBe(0);
    expect(component.state('graph').nodeSet.size).toBe(0);
    expect(component.state('graph').edgeSet.size).toBe(0);
    expect(component.state('loadedArtists').size).toBe(0);
    expect(component.state('graphOptions')).toMatchObject(mockOptions);
    expect(component.state('events')).toMatchObject({
      selectNode: component.instance().handleNodeClick,
    });
  });

  it('changes the search value when handleArtistChange is called', () => {
    const component = shallow(<App />);
    expect(component.state('searchValue')).toBe('');
    component.instance().handleArtistChange('abcdef');
    expect(component.state('searchValue')).toBe('abcdef');
  });

  it('should close the modal when handleModalClose is called', () => {
    const component = shallow(<App />);
    component.instance().setState({
      showModal: true,
    });
    component.instance().handleModalClose();
    expect(component.state('showModal')).toBe(false);
  });

  it('resets the graph when the handleGraphReset is called', () => {
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

    const component = shallow(<App />);
    component.instance().setState({
      searchValue: 'test',
      graph: mockGraph,
      loadedArtists: new Set(['abc']),
    });

    expect(component.state('searchValue')).toBe('test');
    expect(component.state('loadedArtists').size).toBe(1);

    component.instance().handleGraphReset();

    expect(component.state('showModal')).toBe(false);
    expect(component.state('searchValue')).toBe('');
    expect(component.state('searchResults').length).toBe(0);
    expect(component.state('searchResultCards').length).toBe(0);
    expect(component.state('graph').nodes.length).toBe(0);
    expect(component.state('graph').edges.length).toBe(0);
    expect(component.state('graph').nodeSet.size).toBe(0);
    expect(component.state('graph').edgeSet.size).toBe(0);
    expect(component.state('loadedArtists').size).toBe(0);
  });

  it('should not do anything if the clicked artist node has already had related artists loaded', () => {
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
    const mockLoadedArtists = new Set(['abc', 'gasdgasdgasdg']);
    const mockEvent = {
      nodes: ['abc'],
    };

    const component = shallow(<App />);
    component.instance().setState({
      graph: mockGraph,
      loadedArtists: mockLoadedArtists,
    });

    component.instance().handleNodeClick(mockEvent);

    expect(component.state('graph').nodes.length).toBe(2);
    expect(component.state('graph').edges.length).toBe(1);
    expect(component.state('graph').nodeSet.size).toBe(2);
    expect(component.state('graph').edgeSet.size).toBe(1);
    expect(component.state('loadedArtists').size).toBe(2);
  });

  it('should fetch the related artists and update the graph when handleArtistNode is called', async () => {
    const mockFetchRelatedArtists = jest.fn();
    mockFetchRelatedArtists.mockReturnValue([
      {
        id: 'aaa',
        name: 'bbb',
        images: [
          {
            height: 320,
            url: 'qqq',
            width: 320,
          },
        ],
      },
    ]);

    const mockAddRelatedArtistsToGraph = jest.fn();
    mockAddRelatedArtistsToGraph.mockImplementation(
      (graph, artistNodeID, relatedArtists) => {
        const relatedArtist = relatedArtists[0];

        const relatedArtistNode = {
          id: relatedArtist.id,
          label: relatedArtist.name,
          title: relatedArtist.name,
          shape: 'circularImage',
          image: relatedArtist.images[0].url,
        };
        const relatedArtistEdge = {
          id: `${artistNodeID}:aaa`,
          from: `${artistNodeID}`,
          to: 'aaa',
        };

        graph.nodes.push(relatedArtistNode);
        graph.edges.push(relatedArtistEdge);
        graph.nodeSet.add(relatedArtistNode.id);
        graph.edgeSet.add(relatedArtistEdge.id);
      },
    );

    ArtistGraphHelper.fetchRelatedArtists = mockFetchRelatedArtists;
    ArtistGraphHelper.addRelatedArtistsToGraph = mockAddRelatedArtistsToGraph;

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
    const mockLoadedArtists = new Set(['abc']);
    const mockEvent = {
      nodes: ['gasdgasdgasdg'],
    };

    const component = shallow(<App />);

    component.instance().setState({
      graph: mockGraph,
      loadedArtists: mockLoadedArtists,
    });

    expect(component.state('loadedArtists').size).toBe(1);

    await component.instance().handleNodeClick(mockEvent);

    expect(component.state('graph').nodes.length).toBe(3);
    expect(component.state('graph').edges.length).toBe(2);
    expect(component.state('graph').nodeSet.size).toBe(3);
    expect(component.state('graph').edgeSet.size).toBe(2);
    expect(component.state('loadedArtists').size).toBe(2);
  });

  it('should reset the search results and show the modal if no search results are found handleArtistSubmit is called', async () => {
    const mockFetchArtistSearch = jest.fn();
    mockFetchArtistSearch.mockReturnValue(null);

    ArtistGraphHelper.fetchArtistSearch = mockFetchArtistSearch;

    const component = shallow(<App />);

    await component.instance().handleArtistSubmit('aaa');

    expect(component.state('showModal')).toBe(true);
    expect(component.state('searchResults').length).toBe(0);
    expect(component.state('searchResultCards').length).toBe(0);
  });

  it('should fetch artist search results handleArtistSubmit is called', async () => {
    const mockSearchResults = [
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
    const mockFetchArtistSearch = jest.fn();
    mockFetchArtistSearch.mockReturnValue(mockSearchResults);

    ArtistGraphHelper.fetchArtistSearch = mockFetchArtistSearch;

    const component = shallow(<App />);

    await component.instance().handleArtistSubmit('aaa');

    expect(component.state('showModal')).toBe(true);
    expect(component.state('searchResults')).toBe(mockSearchResults);
  });

  it('should close the modal if the artist ID is not found in the search results when handleArtistSelect is called', async () => {
    const component = shallow(<App />);

    component.instance().setState({
      searchResults: [],
      showModal: true,
    });

    await component.instance().handleArtistSelect('aaa');

    expect(component.state('showModal')).toBe(false);
    expect(component.state('graph').nodes.length).toBe(0);
    expect(component.state('graph').edges.length).toBe(0);
    expect(component.state('graph').nodeSet.size).toBe(0);
    expect(component.state('graph').edgeSet.size).toBe(0);
    expect(component.state('loadedArtists').size).toBe(0);
  });

  it('should close the modal if the artist ID is already loaded when handleArtistSelect is called', async () => {
    const mockSearchResults = [
      {
        id: 'aaa',
        name: 'bbb',
        images: [
          {
            height: 320,
            url: 'ccc',
            width: 320,
          },
        ],
      },
    ];

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
    const mockLoadedArtists = new Set(['abc']);

    const component = shallow(<App />);

    component.instance().setState({
      graph: mockGraph,
      searchResults: mockSearchResults,
      loadedArtists: mockLoadedArtists,
      showModal: true,
    });

    await component.instance().handleArtistSelect('abc');

    expect(component.state('showModal')).toBe(false);
    expect(component.state('graph').nodes.length).toBe(2);
    expect(component.state('graph').edges.length).toBe(1);
    expect(component.state('graph').nodeSet.size).toBe(2);
    expect(component.state('graph').edgeSet.size).toBe(1);
    expect(component.state('loadedArtists').size).toBe(1);
  });

  it('should fetch the related artists before updating the graph when handleArtistSelect is called', async () => {
    const mockSearchResults = [
      {
        id: 'aaa',
        name: 'bbb',
        images: [
          {
            height: 320,
            url: 'ccc',
            width: 320,
          },
        ],
      },
    ];
    const mockFetchRelatedArtists = jest.fn();
    mockFetchRelatedArtists.mockReturnValue([
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
    ]);

    const mockAddArtistToGraph = jest.fn();
    mockAddArtistToGraph.mockImplementation((graph, artist) => {
      const artistNode = {
        id: artist.id,
        label: artist.name,
        title: artist.name,
        shape: 'circularImage',
        image: artist.images[0].url,
      };

      graph.nodes.push(artistNode);
      graph.nodeSet.add(artistNode.id);
    });

    const mockAddRelatedArtistsToGraph = jest.fn();
    mockAddRelatedArtistsToGraph.mockImplementation(
      (graph, artistNodeID, relatedArtists) => {
        for (let i = 0; i < relatedArtists.length; i += 1) {
          const relatedArtist = relatedArtists[i];

          const relatedArtistNode = {
            id: relatedArtist.id,
            label: relatedArtist.name,
            title: relatedArtist.name,
            shape: 'circularImage',
            image: relatedArtist.images[0].url,
          };
          const relatedArtistEdge = {
            id: `${artistNodeID}:${relatedArtistNode.id}`,
            from: `${artistNodeID}`,
            to: relatedArtistNode,
          };

          graph.nodes.push(relatedArtistNode);
          graph.edges.push(relatedArtistEdge);
          graph.nodeSet.add(relatedArtistNode.id);
          graph.edgeSet.add(relatedArtistEdge.id);
        }
      },
    );

    ArtistGraphHelper.fetchRelatedArtists = mockFetchRelatedArtists;
    ArtistGraphHelper.addArtistToGraph = mockAddArtistToGraph;
    ArtistGraphHelper.addRelatedArtistsToGraph = mockAddRelatedArtistsToGraph;

    const component = shallow(<App />);

    component.instance().setState({
      searchResults: mockSearchResults,
      loadedArtists: new Set(),
    });

    await component.instance().handleArtistSelect('aaa');

    expect(component.state('showModal')).toBe(false);
    expect(component.state('graph').nodes.length).toBe(3);
    expect(component.state('graph').edges.length).toBe(2);
    expect(component.state('graph').nodeSet.size).toBe(3);
    expect(component.state('graph').edgeSet.size).toBe(2);
    expect(component.state('loadedArtists').size).toBe(1);
  });
});
