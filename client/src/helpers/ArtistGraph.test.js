import { getArtistImageUrlOrDefault } from './ArtistGraph';

test('gets image from artist object', () => {
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
