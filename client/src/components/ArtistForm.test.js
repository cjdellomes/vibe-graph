import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import ArtistForm from './ArtistForm';

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

it('calls the on artist change callback function when input text changes', () => {
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
