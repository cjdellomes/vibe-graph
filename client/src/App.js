import React from 'react';
import './App.css';
import ArtistForm from './components/ArtistForm';
import Graph from 'react-graph-vis';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleArtistSubmit = this.handleArtistSubmit.bind(this);
    this.handleGraphReset = this.handleGraphReset.bind(this);
    this.handleNodeClick = this.handleNodeClick.bind(this);
    this.getArtistNode = this.getArtistNode.bind(this);
    this.getRelatedArtistEdge = this.getRelatedArtistEdge.bind(this);
    this.addArtistToGraph = this.addArtistToGraph.bind(this);
    this.addRelatedArtistsToGraph = this.addRelatedArtistsToGraph.bind(this);
    this.drawArtistAndRelatedArtists = this.drawArtistAndRelatedArtists.bind(this);
    this.drawRelatedArtists = this.drawRelatedArtists.bind(this);

    this.state = {
      searchValue: '',
      graph: {
        nodes: [],
        edges: []
      },
      drawnNodes: new Set(),
      drawnEdges: new Set(),
      loadedArtists: new Set(),
    };

    this.options = {
      autoResize: true,
      layout: {
        hierarchical: false
      },
      edges: {
        width: 0.15,
        color: { inherit: "from" },
        smooth: {
          type: "continuous"
        }
      },
      physics: {
        enabled: true,
        repulsion: {
            centralGravity: 0.0,
            springLength: 50,
            springConstant: 0.01,
            nodeDistance: 200,
            damping: 0.09
        },
        solver: 'repulsion'
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
      }
    };

    this.events = {
      selectNode: this.handleNodeClick
    };
  }

  handleArtistChange(searchValue) {
    this.setState({searchValue});
  }

  handleArtistSubmit(searchValue) {
    this.drawArtistAndRelatedArtists(searchValue);
  }

  handleGraphReset() {
    this.setState({
      searchValue: '',
      graph: {
        nodes: [],
        edges: []
      },
      drawnNodes: new Set(),
      drawnEdges: new Set(),
      loadedArtists: new Set(),
    });
  }

  handleNodeClick(event) {
    const artistNodeID = event.nodes[0];
    if (!this.state.loadedArtists.has(artistNodeID)) {
      this.drawRelatedArtists(artistNodeID);
      this.state.loadedArtists.add(artistNodeID);
    }
  }

  drawArtistAndRelatedArtists(artistName) {
    fetch('/search/' + encodeURIComponent(artistName))
      .then(res => res.json())
      .then(
          (result) => {
              const artist = result.artist;
              const relatedArtists = result.related_artists;
              this.addArtistToGraph(this.state.graph, artist);
              this.addRelatedArtistsToGraph(this.state.graph, artist.id, relatedArtists);
          },
          (error) => {
              console.log(error);
          }
      );
  }

  drawRelatedArtists(artistID) {
    fetch('/related-artists/' + encodeURIComponent(artistID))
      .then(res => res.json())
      .then(
          (result) => {
              const relatedArtists = result.related_artists;
              this.addRelatedArtistsToGraph(this.state.graph, artistID, relatedArtists);
          },
          (error) => {
              console.log(error);
          }
      );
  }

  getArtistImageOrDefault(artist, defaultVal) {
    if (artist.images.length > 0) {
      return artist.images[artist.images.length - 1].url;
    }
    return defaultVal;
  }

  getArtistNode(artist) {
    if (artist == null) {
      return null;
    }

    const artistImage = this.getArtistImageOrDefault(artist, null);

    const artistNode = {
      id: artist.id,
      label: artist.name,
      title: artist.name,
      shape: "circularImage",
      image: artistImage
    };

    return artistNode;
  }

  getRelatedArtistEdge(artistNodeID, relatedArtistNodeID) {
    if (artistNodeID == null || relatedArtistNodeID == null) {
      return null;
    }

    const relatedArtistEdge = {
      id: artistNodeID + ':' + relatedArtistNodeID,
      from: artistNodeID,
      to: relatedArtistNodeID
    };

    return relatedArtistEdge;
  }

  addArtistToGraph(graph, artist) {
    if (artist == null) {
      return;
    }

    let nodes = graph.nodes.slice();
    const edges = graph.edges;

    const artistNode = this.getArtistNode(artist);

    if (!this.state.drawnNodes.has(artistNode.id)) {
      this.state.drawnNodes.add(artistNode.id);
      nodes.push(artistNode);
    }

    this.setState({
      graph: {
        nodes: nodes,
        edges: edges
      }
    });
  }

  addRelatedArtistsToGraph(graph, artistNodeID, relatedArtists) {
    if (relatedArtists == null) {
      return;
    }

    let nodes = graph.nodes.slice();
    let edges = graph.edges.slice();

    for (let i = 0; i < relatedArtists.length; i++) {
      const relatedArtist = relatedArtists[i];

      const relatedArtistNode = this.getArtistNode(relatedArtist);
      const relatedArtistEdge = this.getRelatedArtistEdge(artistNodeID, relatedArtistNode.id);

      if (!this.state.drawnNodes.has(relatedArtistNode.id)) {
        this.state.drawnNodes.add(relatedArtistNode.id);
        nodes.push(relatedArtistNode);
      }

      if (!this.state.drawnEdges.has(relatedArtistEdge.id)) {
        this.state.drawnEdges.add(relatedArtistEdge.id);
        edges.push(relatedArtistEdge);
      }
    }

    this.setState({
      graph: {
        nodes: nodes,
        edges: edges
      }
    });
  }

  render() {
    return (
      <div className="container">
        <ArtistForm searchValue={this.state.searchValue} onArtistChange={this.handleArtistChange} onArtistSubmit={this.handleArtistSubmit} onGraphReset={this.handleGraphReset}/>
        <div className="fullscreen">
          <Graph
            graph={this.state.graph}
            options={this.options}
            events={this.events}
          />
        </div>
      </div>
    );
  }
}

export default App;
