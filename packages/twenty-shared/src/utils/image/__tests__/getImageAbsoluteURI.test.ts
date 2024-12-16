import { getImageAbsoluteURI } from '../getImageAbsoluteURI';

describe('getImageAbsoluteURI', () => {
  it('should return null if imageUrl is empty', () => {
    const imageUrl = '';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBeNull();
  });

  it('should return null if baseUrl is empty', () => {
    const imageUrl = 'https://XXX';
    const baseUrl = '';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBeNull();
  });

  it('should return absolute url if the imageUrl is an absolute url', () => {
    const imageUrl = 'https://XXX';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe(imageUrl);
  });

  it('should return fully formed url if imageUrl is a url', () => {
    const imageUrl = 'pic.png?token=XXX';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe('http://localhost:3000/files/pic.png?token=XXX');
  });

  it('should return fully formed url if imageUrl is a relative url', () => {
    const imageUrl = '/pic.png?token=XXX';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe('http://localhost:3000/files/pic.png?token=XXX');
  });

  it('should return null if imageUrl is an empty string', () => {
    const imageUrl = '';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBeNull();
  });
});
