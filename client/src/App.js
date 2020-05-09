import React from 'react';
import './App.css';
import ArtistForm from './components/ArtistForm';
import Graph from 'react-graph-vis';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleArtistSubmit = this.handleArtistSubmit.bind(this);
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
        hierarchical: false,
        randomSeed: 34
      },
      edges: {
        color: "#000000"
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

  updateGraph(graph, artist, relatedArtists) {
    let nodes = graph.nodes.slice();
    let edges = graph.edges.slice();

    let artistNode = {
      id: artist.name,
      label: artist.name,
      shape: "circularImage",
      image: artist.images[2].url
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

      let relatedArtistNode = {
        id: relatedArtist.name,
        label: relatedArtist.name,
        shape: "circularImage",
        image: relatedArtist.images[relatedArtist.images.length - 1].url,
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
        <ArtistForm searchValue={this.state.searchValue} onArtistChange={this.handleArtistChange} onArtistSubmit={this.handleArtistSubmit}/>
        <Graph
          graph={this.state.graph}
          options={this.options}
          events={this.events}
          style={{height: "800px", width: "800px", border: "1px solid lightgray"}}
        />
      </div>
    );
  }
}

export default App;
