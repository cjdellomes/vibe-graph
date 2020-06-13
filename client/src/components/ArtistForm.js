import React from 'react';
import './ArtistForm.css';
import PropTypes from 'prop-types';

class ArtistForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  handleChange(event) {
    const { onArtistChange } = this.props;
    onArtistChange(event.target.value);
  }

  handleSubmit(event) {
    const { onArtistSubmit, searchValue } = this.props;
    onArtistSubmit(searchValue);
    event.preventDefault();
  }

  handleReset(event) {
    const { onGraphReset } = this.props;
    onGraphReset();
    event.preventDefault();
  }

  render() {
    const { searchValue } = this.props;
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <form
        id="form-box"
        className="transparent-blur"
        onSubmit={this.handleSubmit}
      >
        <button type="button" id="graph-reset" onClick={this.handleReset}>
          Reset
        </button>
        <button type="button" id="artist-submit" onClick={this.handleSubmit}>
          Search
        </button>
        <div id="search-field">
          <input
            type="text"
            value={searchValue}
            onChange={this.handleChange}
            placeholder="Artist Name"
          />
        </div>
      </form>
    );
  }
}

ArtistForm.propTypes = {
  searchValue: PropTypes.string,
  onArtistChange: PropTypes.func,
  onArtistSubmit: PropTypes.func,
  onGraphReset: PropTypes.func,
};

ArtistForm.defaultProps = {
  searchValue: '',
  onArtistChange: () => {},
  onArtistSubmit: () => {},
  onGraphReset: () => {},
};

export default ArtistForm;
