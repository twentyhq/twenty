import { getImageAbsoluteURI } from '@/utils/image/getImageAbsoluteURI';
describe('getImageAbsoluteURI', () => {
  it('should return baseUrl if imageUrl is empty string', () => {
    const imageUrl = '';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe('http://localhost:3000/files/');
  });

  it('should return absolute url if the imageUrl is an absolute url', () => {
    const imageUrl = 'https://XXX';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe(imageUrl);
  });

  it('should return http absolute url unchanged', () => {
    const imageUrl = 'http://XXX/pic.png';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe(imageUrl);
  });

  it('should treat schemes case-insensitively and return them unchanged', () => {
    const baseUrl = 'http://localhost:3000';
    expect(getImageAbsoluteURI({ imageUrl: 'HTTPS://XXX', baseUrl })).toBe(
      'HTTPS://XXX',
    );
    expect(
      getImageAbsoluteURI({ imageUrl: 'Data:image/png;base64,AAAA', baseUrl }),
    ).toBe('Data:image/png;base64,AAAA');
  });

  it('should return data URIs unchanged', () => {
    const imageUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe(imageUrl);
  });

  it('should return blob URLs unchanged', () => {
    const imageUrl = 'blob:http://localhost:3000/123e4567-e89b-12d3';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe(imageUrl);
  });

  it('should return protocol-relative URLs unchanged', () => {
    const imageUrl = '//cdn.example.com/pic.png';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe(imageUrl);
  });

  it('should return fully formed url if imageUrl is a relative url starting with /', () => {
    const imageUrl = '/path/pic.png';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe('http://localhost:3000/files/path/pic.png');
  });

  it('should return fully formed url if imageUrl is a relative url nost starting with slash', () => {
    const imageUrl = 'pic.png';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe('http://localhost:3000/files/pic.png');
  });

  it('should handle queryParameters in the imageUrl', () => {
    const imageUrl = '/pic.png?token=XXX';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe('http://localhost:3000/files/pic.png?token=XXX');
  });
});
