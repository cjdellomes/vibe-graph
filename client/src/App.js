import React from 'react';
import './App.css';
import ArtistForm from './components/ArtistForm';
import Graph from 'react-graph-vis';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleArtistSubmit = this.handleArtistSubmit.bind(this);
    this.updateGraph = this.updateGraph.bind(this);
    this.state = {
      searchValue: '',
      artist: {},
      relatedArtists: [],
      graph: {
        nodes: [],
        edges: []
      }
    };
    this.options = {
      layout: {
        hierarchical: false
      },
      edges: {
        color: "#000000"
      },
      height: "500px"
    };
    this.events = {
      select: function(event) {
        let {nodes, edges} = event;
      }
    };
  }

  handleArtistChange(searchValue) {
    this.setState({searchValue});
  }

  handleArtistSubmit(searchValue) {
    fetch('http://localhost:3001/search/' + encodeURIComponent(searchValue))
      .then(res => res.json())
      .then(
          (result) => {
              console.log(result);
              this.setState({
                  artist: result.artist,
                  relatedArtists: result.related_artists
              });
              this.updateGraph();
          },
          (error) => {
              console.log(error);
          }
      );
  }

  updateGraph() {
    let nodes = [];
    let edges = [];
    let artistNode = {
      id: 'source',
      label: this.state.artist.name
    };
    nodes.push(artistNode);
    
    for (let i = 0; i < this.state.relatedArtists.length; i++) {
      let relatedArtist = this.state.relatedArtists[i];
      let relatedArtistNode = {
        id: i,
        label: relatedArtist.name
      };
      let relatedArtistEdge = {
        from: 'source',
        to: i
      };
      nodes.push(relatedArtistNode);
      edges.push(relatedArtistEdge);
    }

    let graph = {
      nodes,
      edges
    }

    this.setState({graph});
  }

  render() {
    return (
      <div>
        <ArtistForm searchValue={this.state.searchValue} onArtistChange={this.handleArtistChange} onArtistSubmit={this.handleArtistSubmit}/>
        <Graph
          graph={this.state.graph}
          options={this.state.options}
          events={this.state.events}
          style={{height: "800px", width: "500px"}}
        />
      </div>
    );
  }
}

export default App;
