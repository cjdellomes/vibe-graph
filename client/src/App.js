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
      }
    };
    this.events = {
      select: function(event) {
        console.log(event);
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
              let artist = result.artist;
              let relatedArtists = result.related_artists;
              this.setState({
                  artist: artist,
                  relatedArtists: relatedArtists
              });
              this.updateGraph(this.state.graph, artist, relatedArtists);
          },
          (error) => {
              console.log(error);
          }
      );
  }

  updateGraph(graph, artist, relatedArtists) {
    let nodes = [];
    let edges = [];
    let artistNode = {
      id: artist.name,
      label: artist.name,
      shape: "circularImage",
      image: artist.images[2].url
    };
    nodes.push(artistNode);
    
    for (let i = 0; i < relatedArtists.length; i++) {
      let relatedArtist = relatedArtists[i];

      let relatedArtistNode = {
        id: relatedArtist.name,
        label: relatedArtist.name,
        shape: "circularImage",
        image: relatedArtist.images[2].url
      };

      let relatedArtistEdge = {
        from: artist.name,
        to: relatedArtist.name
      };

      nodes.push(relatedArtistNode);
      edges.push(relatedArtistEdge);
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
