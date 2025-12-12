import { appendCopySuffix } from '@/utils/strings/appendCopySuffix';

describe('appendCopySuffix', () => {
  it('should add (Copy) suffix to a string', () => {
    expect(appendCopySuffix('My Dashboard')).toBe('My Dashboard (Copy)');
  });

  it('should not add (Copy) suffix if string already ends with (Copy)', () => {
    expect(appendCopySuffix('My Dashboard (Copy)')).toBe('My Dashboard (Copy)');
  });

  it('should not add (Copy) suffix if string ends with (copy) - case insensitive', () => {
    expect(appendCopySuffix('My Dashboard (copy)')).toBe('My Dashboard (copy)');
  });
});
