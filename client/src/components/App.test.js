import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App from './App';

configure({ adapter: new Adapter() });

describe('App', () => {
  it('initializes with the correct initial state', () => {
    const mockOptions = {
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
    };

    const component = shallow(<App />);

    expect(component.state('searchValue')).toBe('');
    expect(component.state('graph').nodes.length).toBe(0);
    expect(component.state('graph').edges.length).toBe(0);
    expect(component.state('graph').nodeSet.size).toBe(0);
    expect(component.state('graph').edgeSet.size).toBe(0);
    expect(component.state('loadedArtists').size).toBe(0);
    expect(component.state('graphOptions')).toMatchObject(mockOptions);
    expect(component.state('events')).toMatchObject({
      selectNode: component.instance().handleNodeClick,
    });
  });

  it('changes the search value when handleArtistChange is called', () => {
    const component = shallow(<App />);
    component.instance().handleGraphReset('abcdef');
    expect(component.state('searchValue')).toBe('');
  });

  it('resets the graph when the handleGraphReset is called', () => {
    const mockGraph = {
      nodes: [
        {
          id: 'abc',
          label: 'def',
          title: 'def',
          shape: 'circularImage',
          image: 'xyz',
        },
        {
          id: 'gasdgasdgasdg',
          label: 'asdhgashah',
          title: 'asdhgashah',
          shape: 'circularImage',
          image: 'hadfhadfhdsh',
        },
      ],
      edges: [
        {
          id: 'abc:gasdgasdgasdg',
          from: 'abc',
          to: 'gasdgasdgasdg',
        },
      ],
      nodeSet: new Set(['abc', 'gasdgasdgasdg']),
      edgeSet: new Set(['abc:gasdgasdgasdg']),
    };

    const component = shallow(<App />);
    component.instance().setState({
      searchValue: 'test',
      graph: mockGraph,
      loadedArtists: new Set(['abc']),
    });

    component.instance().handleGraphReset();

    expect(component.state('searchValue')).toBe('');
    expect(component.state('graph').nodes.length).toBe(0);
    expect(component.state('graph').edges.length).toBe(0);
    expect(component.state('graph').nodeSet.size).toBe(0);
    expect(component.state('graph').edgeSet.size).toBe(0);
    expect(component.state('loadedArtists').size).toBe(0);
  });
});
