/* eslint-disable react/no-unused-state */
import React from 'react';
import Graph from 'react-graph-vis';
import { Modal } from 'react-bootstrap';
import ArtistForm from './ArtistForm';
import ArtistGraphHelper from '../helpers/ArtistGraph';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleArtistChange = this.handleArtistChange.bind(this);
    this.handleGraphReset = this.handleGraphReset.bind(this);
    this.handleArtistSubmit = this.handleArtistSubmit.bind(this);
    this.handleNodeClick = this.handleNodeClick.bind(this);

    this.state = {
      showModal: false,
      searchValue: '',
      searchResults: [],
      graph: {
        nodes: [],
        edges: [],
        nodeSet: new Set(),
        edgeSet: new Set(),
      },
      loadedArtists: new Set(),
      graphOptions: {
        autoResize: true,
        layout: {
          hierarchical: false,
        },
        edges: {
          width: 0.15,
          color: { inherit: 'from' },
          smooth: {
            type: 'continuous',
          },
        },
        physics: {
          enabled: true,
          repulsion: {
            centralGravity: 0.0,
            springLength: 50,
            springConstant: 0.01,
            nodeDistance: 200,
            damping: 0.09,
          },
          solver: 'repulsion',
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
        },
      },
      events: {
        selectNode: this.handleNodeClick,
      },
    };
  }

  handleModalClose() {
    this.setState({ showModal: false });
  }

  handleArtistChange(searchValue) {
    this.setState({ searchValue });
  }

  handleGraphReset() {
    this.setState({
      searchValue: '',
      searchResults: [],
      graph: {
        nodes: [],
        edges: [],
        nodeSet: new Set(),
        edgeSet: new Set(),
      },
      loadedArtists: new Set(),
    });
  }

  async handleNodeClick(event) {
    const artistNodeID = event.nodes[0];
    const { loadedArtists } = this.state;

    if (loadedArtists.has(artistNodeID)) {
      return;
    }

    loadedArtists.add(artistNodeID);

    const relatedArtists = await ArtistGraphHelper.fetchRelatedArtists(
      artistNodeID,
    );
    const { graph } = this.state;
    const {
      nodes, edges, nodeSet, edgeSet,
    } = graph;

    const graphCopy = {
      nodes: Array.from(nodes),
      edges: Array.from(edges),
      nodeSet: new Set(nodeSet),
      edgeSet: new Set(edgeSet),
    };

    ArtistGraphHelper.addRelatedArtistsToGraph(
      graphCopy,
      artistNodeID,
      relatedArtists,
    );

    this.setState({
      graph: graphCopy,
    });
  }

  async handleArtistSubmit(searchValue) {
    this.setState({ showModal: true });

    const searchResults = await ArtistGraphHelper.fetchArtistSearch(
      searchValue,
    );
    if (searchResults == null) {
      return;
    }

    this.setState({
      searchResults,
    });
  }

  render() {
    const {
      showModal, searchValue, graph, graphOptions, events,
    } = this.state;
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <div className="container">
        <ArtistForm
          searchValue={searchValue}
          onArtistChange={this.handleArtistChange}
          onArtistSubmit={this.handleArtistSubmit}
          onGraphReset={this.handleGraphReset}
        />
        <div className="fullscreen">
          <Graph graph={graph} options={graphOptions} events={events} />
        </div>
        <Modal show={showModal} onHide={this.handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              Artists Matching
              {` ${searchValue}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>test</Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default App;
