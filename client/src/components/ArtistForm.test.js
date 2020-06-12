import React from 'react';
import renderer from 'react-test-renderer';
import ArtistForm from './ArtistForm';

it('renders correctly', () => {
  const tree = renderer
    .create(<ArtistForm
      searchValue="test"
    />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
