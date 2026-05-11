import {
  getEnglishLocaleName,
  getNativeLocaleName,
} from '../utils/locale-display-names';

describe('getNativeLocaleName', () => {
  it('returns the language name in its own language with the first character upper-cased', () => {
    expect(getNativeLocaleName('en')).toBe('English');
    expect(getNativeLocaleName('fr-FR')).toBe('Français');
  });

  it('does not break on scripts that have no concept of letter case', () => {
    const value = getNativeLocaleName('ja-JP');
    expect(value).not.toBe('');
    expect(value).not.toContain('(');
  });
});

describe('getEnglishLocaleName', () => {
  it('returns the English name for the language regardless of the input locale', () => {
    expect(getEnglishLocaleName('en')).toBe('English');
    expect(getEnglishLocaleName('fr-FR')).toBe('French');
  });
});
