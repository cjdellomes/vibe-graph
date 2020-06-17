import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ArtistForm from './ArtistForm';

configure({ adapter: new Adapter() });

describe('ArtistForm', () => {
  it('renders correctly', () => {
    const mockHandleArtistChange = jest.fn();
    const mockHandleArtistSubmit = jest.fn();
    const mockHandleGraphReset = jest.fn();
    const component = renderer.create(
      <ArtistForm
        searchValue=""
        onArtistChange={mockHandleArtistChange}
        onArtistSubmit={mockHandleArtistSubmit}
        onGraphReset={mockHandleGraphReset}
      />,
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls the artist change callback function when input text changes', () => {
    const mockHandleArtistChange = jest.fn();
    const mockHandleArtistSubmit = jest.fn();
    const mockHandleGraphReset = jest.fn();
    const event = {
      target: {
        value: 'test',
      },
    };

    const component = shallow(
      <ArtistForm
        searchValue=""
        onArtistChange={mockHandleArtistChange}
        onArtistSubmit={mockHandleArtistSubmit}
        onGraphReset={mockHandleGraphReset}
      />,
    );

    component.find('input').simulate('change', event);
    expect(mockHandleArtistChange).toHaveBeenCalledWith('test');
  });

  it('calls the artist submit callback function when input is submitted', () => {
    const mockHandleArtistChange = jest.fn();
    const mockHandleArtistSubmit = jest.fn();
    const mockHandleGraphReset = jest.fn();

    const component = shallow(
      <ArtistForm
        searchValue=""
        onArtistChange={mockHandleArtistChange}
        onArtistSubmit={mockHandleArtistSubmit}
        onGraphReset={mockHandleGraphReset}
      />,
    );

    component.find('#artist-submit').simulate('click', {
      preventDefault: () => {},
    });
    expect(mockHandleArtistSubmit).toHaveBeenCalled();
  });

  it('calls the graph reset callback function when the reset button is clicked', () => {
    const mockHandleArtistChange = jest.fn();
    const mockHandleArtistSubmit = jest.fn();
    const mockHandleGraphReset = jest.fn();

    const component = shallow(
      <ArtistForm
        searchValue=""
        onArtistChange={mockHandleArtistChange}
        onArtistSubmit={mockHandleArtistSubmit}
        onGraphReset={mockHandleGraphReset}
      />,
    );

    component.find('#graph-reset').simulate('click', {
      preventDefault: () => {},
    });
    expect(mockHandleGraphReset).toHaveBeenCalled();
  });
});
