import { getArtistImageOrDefault } from './ArtistGraph';

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
  expect(getArtistImageOrDefault(mockArtist, '')).toBe('test.png');
});
