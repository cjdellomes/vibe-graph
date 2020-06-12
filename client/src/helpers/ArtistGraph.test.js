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
