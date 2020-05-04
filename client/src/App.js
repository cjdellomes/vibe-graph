import React from 'react';
import './App.css';
import ArtistForm from './components/ArtistForm';
import {Sigma, RandomizeNodePositions, RelativeSize} from 'react-sigma';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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

  render() {
    return (
      <div>
        <ArtistForm />
        <Sigma style={{maxWidth: 'inherit', height: '600px', borderStyle: 'groove'}} graph={this.state.graph} settings={{drawEdges: true, clone: false}}>
          <RelativeSize initialSize={15}/>
          <RandomizeNodePositions/>
        </Sigma>
      </div>
    );
  }
}

export default App;
