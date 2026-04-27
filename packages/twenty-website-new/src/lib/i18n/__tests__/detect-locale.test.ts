import { detectLocale } from '../detect-locale';

describe('detectLocale', () => {
  it('returns the cookie value when it is a supported locale', () => {
    expect(
      detectLocale({
        cookieValue: 'fr-FR',
        acceptLanguageHeader: 'de-DE,de;q=0.9',
      }),
    ).toBe('fr-FR');
  });

  it('ignores an unsupported cookie value and falls back to Accept-Language', () => {
    expect(
      detectLocale({
        cookieValue: 'xx-YY',
        acceptLanguageHeader: 'de-DE,de;q=0.9',
      }),
    ).toBe('de-DE');
  });

  it('matches the highest-quality Accept-Language entry first', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'en;q=0.5,fr-FR;q=0.9,de;q=0.7',
      }),
    ).toBe('fr-FR');
  });

  it('falls back from a regional tag to the language family', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'fr-CA',
      }),
    ).toBe('fr-FR');
  });

  it('falls back from a bare language tag to the first matching regional locale', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'pt;q=1.0,en;q=0.5',
      }),
    ).toBe('pt-BR');
  });

  it('returns the source locale when no input is provided', () => {
    expect(detectLocale({})).toBe('en');
  });

  it('returns the source locale when nothing in Accept-Language is supported', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'xx-YY,zz-ZZ;q=0.5',
      }),
    ).toBe('en');
  });

  it('treats a malformed quality value as zero (deprioritized)', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'fr-FR;q=not-a-number,de-DE;q=0.5',
      }),
    ).toBe('de-DE');
  });

  it('parses quality values when parameters carry leading whitespace around the semicolon', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'en;q=0.1, fr-FR ; q=0.9, de-DE ; q=0.5',
      }),
    ).toBe('fr-FR');
  });
});
