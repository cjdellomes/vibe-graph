import React from 'react';

class ArtistForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.props.onArtistChange(event.target.value);
    }

    handleSubmit(event) {
        console.log('Artist submitted: ' + this.props.artist);
        this.props.onArtistSubmit(this.props.artist);
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Artist:
                    <input type="text" value={this.props.artist} onChange={this.handleChange} />
                </label>
                <input type="submit" onSubmit={this.handleSubmit} />
            </form>
        );
    }
}

export default ArtistForm;