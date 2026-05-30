import { camelToKebab } from '../camelToKebab';

describe('camelToKebab', () => {
  it('should convert camelCase to kebab-case', () => {
    expect(camelToKebab('camelCase')).toBe('camel-case');
  });

  it('should convert single-word camelCase without changes', () => {
    expect(camelToKebab('people')).toBe('people');
  });

  it('should handle multi-word camelCase', () => {
    expect(camelToKebab('selfHostingUser')).toBe('self-hosting-user');
  });

  it('should convert PascalCase with a leading hyphen due to initial uppercase', () => {
    expect(camelToKebab('PascalCase')).toBe('-pascal-case');
  });

  it('should handle empty string', () => {
    expect(camelToKebab('')).toBe('');
  });
});
