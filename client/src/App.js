import React from 'react';
import './App.css';
import ArtistForm from './components/ArtistForm';
import {Sigma, RandomizeNodePositions, RelativeSize} from 'react-sigma';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleArtistSubmit = this.handleArtistSubmit.bind(this);
    this.state = {
      artist: '',
      relatedArtists: [],
      graph: {
        nodes: [
          {id:'n1', label:'Alice'},
          {id:'n2', label:'Rabbit'}
        ],
        edges: [
          {id:'e1',source:'n1',target:'n2',label:'SEES'}
        ]
      }
    };
  }

  handleArtistChange(artist) {
    this.setState({artist});
  }

  handleArtistSubmit(artist) {
    fetch('http://localhost:3001/search/' + encodeURIComponent(artist))
      .then(res => res.json())
      .then(
          (result) => {
              console.log(result);
              this.setState({
                  artist: result.artist,
                  relatedArtists: result.related_artists
              });
          },
          (error) => {
              console.log(error);
          }
      );
  }

  render() {
    return (
      <div>
        <ArtistForm artist={this.state.artist} onArtistChange={this.handleArtistChange} onArtistSubmit={this.handleArtistSubmit}/>
        <Sigma style={{maxWidth: 'inherit', height: '600px', borderStyle: 'groove'}} graph={this.state.graph} settings={{drawEdges: true, clone: false}}>
          <RelativeSize initialSize={15}/>
          <RandomizeNodePositions/>
        </Sigma>
      </div>
    );
  }
}

export default App;
