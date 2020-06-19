import React from 'react';
import './App.css';
import Graph from 'react-graph-vis';
import ArtistForm from './ArtistForm';
import {
  addArtistToGraph,
  addRelatedArtistsToGraph,
} from '../helpers/ArtistGraph';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleArtistSubmit = this.handleArtistSubmit.bind(this);
    this.handleGraphReset = this.handleGraphReset.bind(this);
    this.handleNodeClick = this.handleNodeClick.bind(this);
    this.drawArtistSearchResults = this.drawArtistSearchResults.bind(this);
    this.drawRelatedArtists = this.drawRelatedArtists.bind(this);

    this.state = {
      searchValue: '',
      graph: {
        nodes: [],
        edges: [],
        nodeSet: new Set(),
        edgeSet: new Set(),
      },
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

  drawRelatedArtists(artistID) {
    fetch(`/related-artists/${encodeURIComponent(artistID)}`)
      .then((res) => res.json())
      .then(
        (result) => {
          const relatedArtists = result.related_artists;

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

          addRelatedArtistsToGraph(graphCopy, artistID, relatedArtists);

          this.setState({
            graph: graphCopy,
          });
        },
        (error) => {
          console.log(error);
        },
      );
  }

  drawArtistSearchResults(artistName) {
    fetch(`/search/${encodeURIComponent(artistName)}`)
      .then((res) => res.json())
      .then(
        (result) => {
          const { artist } = result;
          const relatedArtists = result.related_artists;

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

          addArtistToGraph(graphCopy, artist);
          addRelatedArtistsToGraph(graphCopy, artist.id, relatedArtists);

          this.setState({
            graph: graphCopy,
          });
        },
        (error) => {
          console.log(error);
        },
      );
  }

  handleNodeClick(event) {
    const artistNodeID = event.nodes[0];
    const { loadedArtists } = this.state;
    if (!loadedArtists.has(artistNodeID)) {
      this.drawRelatedArtists(artistNodeID);
      loadedArtists.add(artistNodeID);
    }
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
      loadedArtists: new Set(),
    });
  }

  handleArtistSubmit(searchValue) {
    this.drawArtistSearchResults(searchValue);
  }

  handleArtistChange(searchValue) {
    this.setState({ searchValue });
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
