import React from 'react';
import './App.css';
import Graph from 'react-graph-vis';
import ArtistForm from './components/ArtistForm';
import { getRelatedArtistEdge, getArtistNode } from './helpers/ArtistGraph';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleArtistSubmit = this.handleArtistSubmit.bind(this);
    this.handleGraphReset = this.handleGraphReset.bind(this);
    this.handleNodeClick = this.handleNodeClick.bind(this);
    this.addArtistToGraph = this.addArtistToGraph.bind(this);
    this.addRelatedArtistsToGraph = this.addRelatedArtistsToGraph.bind(this);
    this.drawArtistSearchResults = this.drawArtistSearchResults.bind(this);
    this.drawRelatedArtists = this.drawRelatedArtists.bind(this);

    this.state = {
      searchValue: '',
      graph: {
        nodes: [],
        edges: [],
      },
      drawnNodes: new Set(),
      drawnEdges: new Set(),
      loadedArtists: new Set(),
    };

    this.options = {
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

    this.events = {
      selectNode: this.handleNodeClick,
    };
  }

  drawRelatedArtists(artistID) {
    fetch(`/related-artists/${encodeURIComponent(artistID)}`)
      .then((res) => res.json())
      .then(
        (result) => {
          const relatedArtists = result.related_artists;
          this.addRelatedArtistsToGraph(artistID, relatedArtists);
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

          this.addArtistToGraph(artist);
          this.addRelatedArtistsToGraph(artist.id, relatedArtists);
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
      },
      drawnNodes: new Set(),
      drawnEdges: new Set(),
      loadedArtists: new Set(),
    });
  }

  handleArtistSubmit(searchValue) {
    this.drawArtistSearchResults(searchValue);
  }

  handleArtistChange(searchValue) {
    this.setState({ searchValue });
  }

  addArtistToGraph(artist) {
    if (artist == null) {
      return;
    }

    const { graph } = this.state;
    const nodes = graph.nodes.slice();
    const edges = graph.edges.slice();

    const artistNode = getArtistNode(artist);

    const { drawnNodes } = this.state;
    if (!drawnNodes.has(artistNode.id)) {
      drawnNodes.add(artistNode.id);
      nodes.push(artistNode);
    }

    this.setState({
      graph: {
        nodes,
        edges,
      },
    });
  }

  addRelatedArtistsToGraph(artistNodeID, relatedArtists) {
    if (relatedArtists == null) {
      return;
    }

    const { graph } = this.state;
    const nodes = graph.nodes.slice();
    const edges = graph.edges.slice();

    for (let i = 0; i < relatedArtists.length; i += 1) {
      const relatedArtist = relatedArtists[i];

      const relatedArtistNode = getArtistNode(relatedArtist);
      const relatedArtistEdge = getRelatedArtistEdge(
        artistNodeID,
        relatedArtistNode.id,
      );

      const { drawnNodes, drawnEdges } = this.state;
      if (!drawnNodes.has(relatedArtistNode.id)) {
        drawnNodes.add(relatedArtistNode.id);
        nodes.push(relatedArtistNode);
      }
      if (!drawnEdges.has(relatedArtistEdge.id)) {
        drawnEdges.add(relatedArtistEdge.id);
        edges.push(relatedArtistEdge);
      }
    }

    this.setState({
      graph: {
        nodes,
        edges,
      },
    });
  }

  render() {
    const { searchValue, graph } = this.state;
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
          <Graph graph={graph} options={this.options} events={this.events} />
        </div>
      </div>
    );
  }
}

export default App;
