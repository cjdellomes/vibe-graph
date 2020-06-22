import React from 'react';
import './App.css';
import Graph from 'react-graph-vis';
import ArtistForm from './ArtistForm';
import ArtistGraphHelper from '../helpers/ArtistGraph';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleGraphReset = this.handleGraphReset.bind(this);
    this.handleArtistSubmit = this.handleArtistSubmit.bind(this);
    this.handleNodeClick = this.handleNodeClick.bind(this);

    this.state = {
      searchValue: '',
      graph: {
        nodes: [],
        edges: [],
        nodeSet: new Set(),
        edgeSet: new Set(),
      },
      searchedArtists: new Set(),
      loadedArtists: new Set(),
      graphOptions: {
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
      },
      events: {
        selectNode: this.handleNodeClick,
      },
    };
  }

  handleArtistChange(searchValue) {
    this.setState({ searchValue });
  }

  handleGraphReset() {
    this.setState({
      searchValue: '',
      graph: {
        nodes: [],
        edges: [],
        nodeSet: new Set(),
        edgeSet: new Set(),
      },
      searchedArtists: new Set(),
      loadedArtists: new Set(),
    });
  }

  async handleNodeClick(event) {
    const artistNodeID = event.nodes[0];
    const { loadedArtists } = this.state;

    if (loadedArtists.has(artistNodeID)) {
      return;
    }

    loadedArtists.add(artistNodeID);

    const relatedArtists = await ArtistGraphHelper.fetchRelatedArtists(
      artistNodeID,
    );
    const { graph } = this.state;
    const {
      nodes, edges, nodeSet, edgeSet,
    } = graph;

    const graphCopy = {
      nodes: Array.from(nodes),
      edges: Array.from(edges),
      nodeSet: new Set(nodeSet),
      edgeSet: new Set(edgeSet),
    };

    ArtistGraphHelper.addRelatedArtistsToGraph(
      graphCopy,
      artistNodeID,
      relatedArtists,
    );

    this.setState({
      graph: graphCopy,
    });
  }

  async handleArtistSubmit(searchValue) {
    const { loadedArtists, searchedArtists } = this.state;

    if (searchedArtists.has(searchValue)) {
      return;
    }

    searchedArtists.add(searchValue);

    const searchResult = await ArtistGraphHelper.fetchArtistSearch(searchValue);
    const { artist } = searchResult;
    const relatedArtists = searchResult.related_artists;

    if (loadedArtists.has(artist.id)) {
      return;
    }

    loadedArtists.add(artist.id);

    const { graph } = this.state;
    const {
      nodes, edges, nodeSet, edgeSet,
    } = graph;

    const graphCopy = {
      nodes: Array.from(nodes),
      edges: Array.from(edges),
      nodeSet: new Set(nodeSet),
      edgeSet: new Set(edgeSet),
    };

    ArtistGraphHelper.addArtistToGraph(graphCopy, artist);
    ArtistGraphHelper.addRelatedArtistsToGraph(
      graphCopy,
      artist.id,
      relatedArtists,
    );

    this.setState({
      graph: graphCopy,
    });
  }

  render() {
    const {
      searchValue, graph, graphOptions, events,
    } = this.state;
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <div className="container">
        <ArtistForm
          searchValue={searchValue}
          onArtistChange={this.handleArtistChange}
          onArtistSubmit={this.handleArtistSubmit}
          onGraphReset={this.handleGraphReset}
        />
        <div className="fullscreen">
          <Graph graph={graph} options={graphOptions} events={events} />
        </div>
      </div>
    );
  }
}

export default App;
