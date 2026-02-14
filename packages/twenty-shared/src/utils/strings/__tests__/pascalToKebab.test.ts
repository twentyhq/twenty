import { pascalToKebab } from '../pascalToKebab';

describe('pascalToKebab', () => {
  it('should convert PascalCase to kebab-case', () => {
    expect(pascalToKebab('UserProfile')).toBe('user-profile');
  });

  it('should convert single word', () => {
    expect(pascalToKebab('Button')).toBe('button');
  });

  it('should handle consecutive uppercase letters', () => {
    expect(pascalToKebab('HTMLElement')).toBe('html-element');
  });

  it('should handle numbers in the name', () => {
    expect(pascalToKebab('H1Title')).toBe('h1-title');
  });

  it('should handle multi-word PascalCase', () => {
    expect(pascalToKebab('MyComponentName')).toBe('my-component-name');
  });

  it('should handle already lowercase', () => {
    expect(pascalToKebab('button')).toBe('button');
  });
});
