import { detectLocale } from '../utils/detect-locale';

describe('detectLocale', () => {
  it('returns the cookie value when it is a published website locale', () => {
    expect(
      detectLocale({
        cookieValue: 'en',
        acceptLanguageHeader: 'de-DE,de;q=0.9',
      }),
    ).toBe('en');
  });

  it('ignores unsupported cookie and Accept-Language values', () => {
    expect(
      detectLocale({
        cookieValue: 'xx-YY',
        acceptLanguageHeader: 'de-DE,de;q=0.9',
      }),
    ).toBe('en');
  });

  it('matches the highest-quality published Accept-Language entry first', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'en;q=0.5,fr-FR;q=0.9,de;q=0.7',
      }),
    ).toBe('fr-FR');
  });

  it('matches a regional language to a published locale with the same language subtag', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'fr-CA',
      }),
    ).toBe('fr-FR');
  });

  it('falls back to the source locale when a bare language is not published', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'pt;q=1.0,en;q=0.5',
      }),
    ).toBe('en');
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
    ).toBe('en');
  });

  it('parses quality values when parameters carry leading whitespace around the semicolon', () => {
    expect(
      detectLocale({
        acceptLanguageHeader: 'en;q=0.1, fr-FR ; q=0.9, de-DE ; q=0.5',
      }),
    ).toBe('fr-FR');
  });
});
