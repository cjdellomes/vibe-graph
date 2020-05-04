import React from 'react';
import './App.css';
import ArtistForm from './components/ArtistForm';
import {Sigma, RandomizeNodePositions, RelativeSize} from 'react-sigma';

class UpdateNodeProps extends React.Component {
  componentWillReceiveProps({sigma, nodes}) {
    console.log(this.props);
    sigma.graph.nodes().forEach(n => {
      let updated = nodes.find(e => e.id === n.id);
      Object.assign(n, updated);
    });
  }

  render = () => null;
}

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
        nodes: [
          {id:'source', label:'Alice'},
          {id:'n0', label:'Rabbit'}
        ],
        edges: [
          {id:'e0',source:'source',target:'n0',label:'SEES'}
        ]
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
        id: 'n' + i,
        label: relatedArtist.name
      };
      let relatedArtistEdge = {
        id: 'e' + i,
        source: 'source',
        target: 'n' + i
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
        <Sigma 
          style={{maxWidth: 'inherit', height: '600px', borderStyle: 'groove'}}
          graph={this.state.graph}
          settings={{drawEdges: true, clone: false}}>
          <UpdateNodeProps nodes={this.state.graph.nodes}/>
          <RelativeSize initialSize={15}/>
          <RandomizeNodePositions/>
        </Sigma>
      </div>
    );
  }
}

export default App;
