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
    let artist = event.nodes[0];
    if (!this.state.loadedArtists.has(artist)) {
      this.drawRelatedArtists(artist);
    }
  }

  drawRelatedArtists(artist) {
    fetch('http://localhost:3001/search/' + encodeURIComponent(artist))
      .then(res => res.json())
      .then(
          (result) => {
              let artist = result.artist;
              let relatedArtists = result.related_artists;
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

  updateGraph(graph, artist, relatedArtists) {
    let nodes = graph.nodes.slice();
    let edges = graph.edges.slice();

    let artistImage = this.getArtistImageOrDefault(artist, undefined);

    let artistNode = {
      id: artist.name,
      label: artist.name,
      title: artist.name,
      shape: "circularImage",
      image: artistImage
    };

    if (!this.state.drawnNodes.has(artist.name)) {
      this.state.drawnNodes.add(artist.name);
      nodes.push(artistNode);
    }

    if (!this.state.loadedArtists.has(artist.name)) {
      this.state.loadedArtists.add(artist.name);
    }
    
    for (let i = 0; i < relatedArtists.length; i++) {
      let relatedArtist = relatedArtists[i];

      let relatedArtistImage = this.getArtistImageOrDefault(relatedArtist, undefined);

      let relatedArtistNode = {
        id: relatedArtist.name,
        label: relatedArtist.name,
        title: relatedArtist.name,
        shape: "circularImage",
        image: relatedArtistImage,
      };

      let relatedArtistEdge = {
        id: artist.name + ':' + relatedArtist.name,
        from: artist.name,
        to: relatedArtist.name
      };

      if (!this.state.drawnNodes.has(relatedArtist.name)) {
        this.state.drawnNodes.add(relatedArtist.name);
        nodes.push(relatedArtistNode);
      }

      if (!this.state.drawnEdges.has(relatedArtistEdge.id)) {
        this.state.drawnEdges.add(relatedArtistEdge.id);
        edges.push(relatedArtistEdge);
      }
    }

    graph = {
      nodes,
      edges
    };

    this.setState({graph});
  }

  render() {
    return (
      <div>
        <ArtistForm searchValue={this.state.searchValue} onArtistChange={this.handleArtistChange} onArtistSubmit={this.handleArtistSubmit} onGraphReset={this.handleGraphReset}/>
        <Graph
          graph={this.state.graph}
          options={this.options}
          events={this.events}
          style={{height: "800px", width: "1800px", border: "1px solid lightgray"}}
        />
      </div>
    );
  }
}

export default App;
