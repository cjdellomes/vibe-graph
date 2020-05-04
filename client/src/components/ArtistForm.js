import React from 'react';

class ArtistForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { searchValue: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ searchValue: event.target.value });
    }

    handleSubmit(event) {
        console.log('Artist submitted: ' + this.state.searchValue);
        fetch('http://localhost:3001/search/' + encodeURIComponent(this.state.searchValue))
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                    this.setState({
                        isLoaded: true,
                        artist: result.artist,
                        relatedArtists: result.related_artists
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            );
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Artist:
                    <input type="text" value={this.state.searchValue} onChange={this.handleChange} />
                </label>
                <input type="submit" onSubmit={this.handleSubmit} />
            </form>
        );
    }
}

export default ArtistForm;