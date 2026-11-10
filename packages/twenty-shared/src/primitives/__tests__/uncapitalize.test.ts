import { uncapitalize } from '@/primitives/uncapitalize';
describe('uncapitalize', () => {
  it('should uncapitalize a string', () => {
    expect(uncapitalize('Test')).toBe('test');
  });

  it('should return an empty string if input is an empty string', () => {
    expect(uncapitalize('')).toBe('');
  });
});
