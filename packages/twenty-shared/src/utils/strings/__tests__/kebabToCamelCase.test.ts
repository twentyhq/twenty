import { kebabToCamelCase } from '../kebabToCamelCase';

describe('kebabToCamelCase', () => {
  it('should convert kebab-case to camelCase', () => {
    expect(kebabToCamelCase('user-profile')).toBe('userProfile');
  });

  it('should convert single word', () => {
    expect(kebabToCamelCase('button')).toBe('button');
  });

  it('should handle multi-word kebab-case', () => {
    expect(kebabToCamelCase('my-component-name')).toBe('myComponentName');
  });

  it('should handle empty string', () => {
    expect(kebabToCamelCase('')).toBe('');
  });
});
