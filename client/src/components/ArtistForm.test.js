import React from 'react';
import renderer from 'react-test-renderer';
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
