import React from 'react';
import './ArtistForm.css';

class ArtistForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    handleChange(event) {
        this.props.onArtistChange(event.target.value);
    }

    handleSubmit(event) {
        this.props.onArtistSubmit(this.props.searchValue);
        event.preventDefault();
    }

    handleReset(event) {
        this.props.onGraphReset();
        event.preventDefault();
    }

    render() {
        return (
            <form id="form-box" className="transparent-blur" onSubmit={this.handleSubmit}>
                <button type="button" onClick={this.handleReset}>Reset</button>
                <button type="button" onClick={this.handleSubmit}>Search</button>
                <div id="search-field">
                    <input type="text" value={this.props.searchValue} onChange={this.handleChange} placeholder="Artist Name" />
                </div>
            </form>
        );
    }
}

export default ArtistForm;