import { normalizeSearchText } from '../normalizeSearchText';

describe('normalizeSearchText', () => {
  it.each([
    { text: 'Côte d’Ivoire', expected: 'cote d’ivoire' },
    { text: 'Việt Nam', expected: 'viet nam' },
    { text: 'Åland å', expected: 'aland a' },
    { text: 'A\u0300\u0301', expected: 'a' },
  ])('folds Latin accents in $text', ({ text, expected }) => {
    expect(normalizeSearchText(text)).toBe(expected);
  });

  it.each([
    { text: 'Đan Mạch', expected: 'dan mach' },
    { text: 'Kıbrıs', expected: 'kibris' },
    { text: 'Ŋaŋ', expected: 'ngang' },
    { text: 'ÆØÐÞŁŒẞ', expected: 'aeodthloess' },
  ])('folds non-decomposing Latin letters in $text', ({ text, expected }) => {
    expect(normalizeSearchText(text)).toBe(expected);
  });

  it.each(['ガボン', 'カ\u3099ホ\u3099ン'])(
    'preserves Japanese voiced consonants in %s',
    (text) => {
      const normalizedText = normalizeSearchText(text);

      expect(normalizedText).toBe('ガボン');
      expect(normalizedText).not.toContain(normalizeSearchText('カ'));
      expect(normalizedText).toContain(normalizeSearchText('カ\u3099'));
    },
  );

  it.each(['भारत', 'Україна', 'Ελλάδα'])(
    'preserves non-Latin marks in %s',
    (text) => {
      expect(normalizeSearchText(text)).toBe(text.toLowerCase());
    },
  );

  it.each([null, undefined, ''])('accepts missing text %s', (text) => {
    expect(normalizeSearchText(text)).toBe('');
  });

  it('preserves whitespace and punctuation while folding case', () => {
    expect(normalizeSearchText('  Country #123  ')).toBe('  country #123  ');
  });
});
