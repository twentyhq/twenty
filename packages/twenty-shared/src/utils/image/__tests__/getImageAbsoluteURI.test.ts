import { getImageAbsoluteURI } from '../../../../src';

describe('getImageAbsoluteURI', () => {
  it('should return null if imageUrl is empty', () => {
    const imageUrl = '';
    const serverUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI(imageUrl, serverUrl);
    expect(result).toBeNull();
  });

  it('should return null if serverUrl is empty', () => {
    const imageUrl = 'https://XXX';
    const serverUrl = '';
    const result = getImageAbsoluteURI(imageUrl, serverUrl);
    expect(result).toBeNull();
  });

  it('should return absolute url if the imageUrl is an absolute url', () => {
    const imageUrl = 'https://XXX';
    const serverUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI(imageUrl, serverUrl);
    expect(result).toBe(imageUrl);
  });

  it('should return fully formed url if imageUrl is a url', () => {
    const imageUrl = 'pic.png?token=XXX';
    const serverUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI(imageUrl, serverUrl);
    expect(result).toBe('http://localhost:3000/files/pic.png?token=XXX');
  });

  it('should return fully formed url if imageUrl is a relative url', () => {
    const imageUrl = '/pic.png?token=XXX';
    const serverUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI(imageUrl, serverUrl);
    expect(result).toBe('http://localhost:3000/files/pic.png?token=XXX');
  });

  it('should return null if imageUrl is an empty string', () => {
    const imageUrl = '';
    const serverUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI(imageUrl, serverUrl);
    expect(result).toBeNull();
  });
});
