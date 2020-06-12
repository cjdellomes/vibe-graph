import {
  getArtistImageUrlOrDefault,
  getRelatedArtistEdge,
  getArtistNode,
} from './ArtistGraph';

test('gets last image from given artist object', () => {
  const mockArtist = {
    images: [
      {
        height: 640,
        url: 'test.png',
        width: 640,
      },
      {
        height: 320,
        url: 'test2.png',
        width: 320,
      },
    ],
  };
  expect(getArtistImageUrlOrDefault(mockArtist, '')).toBe('test2.png');
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

test('gets null object given an undefined artist node ID', () => {
  expect(getRelatedArtistEdge(undefined, 'def')).toBe(null);
});

test('gets null object given an undefined related artist node ID ', () => {
  expect(getRelatedArtistEdge('abc', undefined)).toBe(null);
});

test('gets null object given an empty string artist node ID', () => {
  expect(getRelatedArtistEdge('', 'def')).toBe(null);
});

test('gets null object given an empty string related artist node ID ', () => {
  expect(getRelatedArtistEdge('abc', '')).toBe(null);
});

test('get an artist node given an artist object', () => {
  const mockArtist = {
    id: 'a1b2c3',
    name: 'def',
    images: [
      {
        height: 640,
        url: 'test.png',
        weight: 640,
      },
    ],
  };

  const mockArtistNode = {
    id: mockArtist.id,
    label: mockArtist.name,
    title: mockArtist.name,
    shape: 'circularImage',
    image: mockArtist.images[0].url,
  };

  expect(getArtistNode(mockArtist)).toMatchObject(mockArtistNode);
});

test('get a null object given a null object', () => {
  expect(getArtistNode(null)).toBe(null);
});

test('get a null object given an undefined object', () => {
  expect(getArtistNode(undefined)).toBe(null);
});
