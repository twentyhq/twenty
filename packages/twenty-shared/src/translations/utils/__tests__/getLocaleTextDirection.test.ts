import { getLocaleTextDirection } from '@/translations/utils/getLocaleTextDirection';
import { APP_LOCALES } from '@/translations/constants/AppLocales';

describe('getLocaleTextDirection', () => {
  it.each([
    ['ar-SA', 'rtl'],
    ['he-IL', 'rtl'],
    ['en', 'ltr'],
    ['fr-FR', 'ltr'],
    ['zh-CN', 'ltr'],
    ['sr-Latn', 'ltr'],
    ['uz-UZ', 'ltr'],
  ])('reads %s as %s', (locale, expected) => {
    expect(getLocaleTextDirection(locale)).toBe(expected);
  });

  it('matches on the language subtag, not the region', () => {
    expect(getLocaleTextDirection('ar')).toBe('rtl');
    expect(getLocaleTextDirection('ar-EG')).toBe('rtl');
  });

  // A locale it cannot place is laid out left to right rather than throwing:
  // the wrong direction is recoverable, a blank app is not.
  it('falls back to ltr for an unknown locale', () => {
    expect(getLocaleTextDirection('zz-ZZ')).toBe('ltr');
    expect(getLocaleTextDirection('')).toBe('ltr');
  });

  it('places every locale the app ships', () => {
    const directions = Object.values(APP_LOCALES).map(getLocaleTextDirection);

    expect(directions.filter((direction) => direction === 'rtl')).toHaveLength(
      2,
    );
  });
});
