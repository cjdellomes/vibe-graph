import React from 'react';

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
        console.log('Artist submitted: ' + this.props.searchValue);
        this.props.onArtistSubmit(this.props.searchValue);
        event.preventDefault();
    }

    handleReset(event) {
        this.props.onGraphReset();
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Artist:
                        <input type="text" value={this.props.searchValue} onChange={this.handleChange} />
                    </label>
                    <input type="submit" onSubmit={this.handleSubmit} />
                    <input type="reset" onClick={this.handleReset} />
                </form>
            </div>
        );
    }
}

export default ArtistForm;