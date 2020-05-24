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
    this.updateGraph = this.updateGraph.bind(this);
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
    this.drawRelatedArtists(searchValue);
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
    const artist = event.nodes[0];
    if (!this.state.loadedArtists.has(artist)) {
      this.drawRelatedArtists(artist);
    }
  }

  drawRelatedArtists(artistName) {
    fetch('http://localhost:3001/search/' + encodeURIComponent(artistName))
      .then(res => res.json())
      .then(
          (result) => {
              const artist = result.artist;
              const relatedArtists = result.related_artists;
              this.updateGraph(this.state.graph, artist, relatedArtists);
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
    if (artist === null || artist === undefined) {
      return null;
    }

    const artistImage = this.getArtistImageOrDefault(artist, null);

    const artistNode = {
      id: artist.name,
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

  updateGraph(graph, artist, relatedArtists) {
    if (artist === null || artist === undefined) {
      return;
    }

    let nodes = graph.nodes.slice();
    let edges = graph.edges.slice();

    const artistNode = this.getArtistNode(artist);

    if (!this.state.drawnNodes.has(artistNode.id)) {
      this.state.drawnNodes.add(artistNode.id);
      nodes.push(artistNode);
    }

    if (!this.state.loadedArtists.has(artistNode.id)) {
      this.state.loadedArtists.add(artistNode.id);
    }

    if (relatedArtists !== undefined && relatedArtists !== null) {
      for (let i = 0; i < relatedArtists.length; i++) {
        const relatedArtist = relatedArtists[i];
  
        const relatedArtistNode = this.getArtistNode(relatedArtist);
  
        const relatedArtistEdge = this.getRelatedArtistEdge(artist.name, relatedArtist.name);
  
        if (!this.state.drawnNodes.has(relatedArtist.name)) {
          this.state.drawnNodes.add(relatedArtist.name);
          nodes.push(relatedArtistNode);
        }
  
        if (!this.state.drawnEdges.has(relatedArtistEdge.id)) {
          this.state.drawnEdges.add(relatedArtistEdge.id);
          edges.push(relatedArtistEdge);
        }
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
