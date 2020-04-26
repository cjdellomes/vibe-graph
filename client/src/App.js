import React from 'react';
import './App.css';
import ArtistForm from './components/ArtistForm';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ArtistForm />
    );
  }
}

export default App;
