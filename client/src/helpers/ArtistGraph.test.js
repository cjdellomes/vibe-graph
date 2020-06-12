import {
  getArtistImageUrlOrDefault,
  getRelatedArtistEdge,
} from './ArtistGraph';

test('gets image from given artist object', () => {
  const mockArtist = {
    images: [
      {
        height: 640,
        url: 'test.png',
        width: 640,
      },
    ],
  };
  expect(getArtistImageUrlOrDefault(mockArtist, '')).toBe('test.png');
});

test('gets empty string from artist object with empty image list', () => {
  const mockArtist = {
    images: [],
  };
  expect(getArtistImageUrlOrDefault(mockArtist, '')).toBe('');
});

test('gets related artist edge given artist node ID and related artist node ID', () => {
  const mockRelatedArtistEdge = {
    id: 'abc:def',
    from: 'abc',
    to: 'def',
  };
  expect(getRelatedArtistEdge('abc', 'def')).toMatchObject(
    mockRelatedArtistEdge,
  );
});

test('gets null object given a null artist node ID', () => {
  expect(getRelatedArtistEdge(null, 'def')).toBe(null);
});

test('gets null object given a null related artist node ID ', () => {
  expect(getRelatedArtistEdge('abc', null)).toBe(null);
});
