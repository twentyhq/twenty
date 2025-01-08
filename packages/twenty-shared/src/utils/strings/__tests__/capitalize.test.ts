import { capitalize } from '../capitalize.util';
describe('capitalize', () => {
  it('should capitalize a string', () => {
    expect(capitalize('test')).toBe('Test');
  });

  it('should return an empty string if input is an empty string', () => {
    expect(capitalize('')).toBe('');
  });
});
