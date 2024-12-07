import { getImageAbsoluteURI } from '../getImageAbsoluteURI';

describe('getImageAbsoluteURI', () => {
  it('should return absolute url if the imageUrl is an absolute url', () => {
    const imageUrl = 'https://XXX';
    const result = getImageAbsoluteURI(imageUrl);
    expect(result).toBe(imageUrl);
  });

  it('should return absolute url if the imageUrl is an absolute unsecure url', () => {
    const imageUrl = 'http://XXX';
    const result = getImageAbsoluteURI(imageUrl);
    expect(result).toBe(imageUrl);
  });

  it('should return fully formed url if imageUrl is a relative url', () => {
    const imageUrl = 'XXX';
    const result = getImageAbsoluteURI(imageUrl);
    expect(result).toBe('http://localhost:3000/files/XXX');
  });
});
