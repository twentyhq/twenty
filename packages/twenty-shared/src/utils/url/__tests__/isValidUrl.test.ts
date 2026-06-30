import { isValidUrl } from '@/utils/url/isValidUrl';

describe('isValidUrl', () => {
  it('test cases', () => {
    // Truthy
    expect(isValidUrl('https://www.example.com')).toBe(true);
    expect(isValidUrl('http://192.168.2.0:3000')).toBe(true);
    expect(isValidUrl('http://localhost')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('http://subdomain.example.com')).toBe(true);
    expect(isValidUrl('https://www.example.com/path')).toBe(true);
    expect(isValidUrl('https://www.example.com/path/path2?query=123')).toBe(
      true,
    );
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('example.com')).toBe(true);
    expect(isValidUrl('www.subdomain.example.com')).toBe(true);
    expect(isValidUrl('192.168.2.0')).toBe(true);
    expect(isValidUrl('3.com')).toBe(true);

    // Falsy
    expect(isValidUrl('?o')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('\\')).toBe(false);
    expect(isValidUrl('wwwexamplecom')).toBe(false);
    expect(isValidUrl('lydia,com')).toBe(false);
    expect(isValidUrl('2/toto')).toBe(false);
    expect(isValidUrl('2')).toBe(false);
  });
});
