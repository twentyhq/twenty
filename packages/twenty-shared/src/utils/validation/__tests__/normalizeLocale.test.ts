import { SOURCE_LOCALE } from '@/translations';
import { normalizeLocale } from '../normalizeLocale';

describe('normalizeLocale', () => {
  it('should return SOURCE_LOCALE when the input is null', () => {
    expect(normalizeLocale(null)).toBe(SOURCE_LOCALE);
  });

  it('should return the locale when there is a direct match in APP_LOCALES', () => {
    // Test a few valid locales
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('fr-FR')).toBe('fr-FR');
    expect(normalizeLocale('es-ES')).toBe('es-ES');
  });

  it('should handle case-insensitive matches', () => {
    // Test with lowercase variants of the locales
    expect(normalizeLocale('fr-fr')).toBe('fr-FR');
    expect(normalizeLocale('es-es')).toBe('es-ES');
    expect(normalizeLocale('DE-de')).toBe('de-DE');
  });

  it('should match just the language part if full locale not found', () => {
    // Test with just the language code
    expect(normalizeLocale('fr')).toBe('fr-FR');
    expect(normalizeLocale('es')).toBe('es-ES');
    expect(normalizeLocale('de')).toBe('de-DE');
  });

  it('should handle language codes that might map to multiple locales', () => {
    // Test for language codes that might have multiple possible mappings
    // For example, 'pt' could map to either 'pt-PT' or 'pt-BR'
    // The implementation should map consistently to one of them
    expect(normalizeLocale('pt')).toBeTruthy();
    // Verify it's one of the expected values
    expect(['pt-PT', 'pt-BR']).toContain(normalizeLocale('pt'));
  });

  it('should return SOURCE_LOCALE for unsupported or invalid locales', () => {
    expect(normalizeLocale('invalid-locale')).toBe(SOURCE_LOCALE);
    expect(normalizeLocale('xx-XX')).toBe(SOURCE_LOCALE);
    expect(normalizeLocale('')).toBe(SOURCE_LOCALE);
  });

  it('should handle SOURCE_LOCALE and its variants correctly', () => {
    expect(normalizeLocale(SOURCE_LOCALE)).toBe(SOURCE_LOCALE);
    // If SOURCE_LOCALE is 'en', test 'en-US', 'en-GB', etc.
    if (SOURCE_LOCALE === 'en') {
      expect(normalizeLocale('en-US')).toBe(SOURCE_LOCALE);
      expect(normalizeLocale('en-GB')).toBe(SOURCE_LOCALE);
    }
  });
});
