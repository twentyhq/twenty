import { isDefined } from './validation/isDefined';

/**
 * Determines whether a given locale is a Right-To-Left (RTL) locale.
 *
 * The check is performed using a list of common RTL language codes. The
 * comparison is case-insensitive and matches locale prefixes, so `fa` and
 * `fa-IR` will both return `true`.
 */
export const isRtlLocale = (locale: string | undefined | null): boolean => {
  if (!isDefined(locale)) {
    return false;
  }

  const rtlLocales = [
    'ar', // Arabic
    'fa', // Persian / Farsi
    'he', // Hebrew
    'ur', // Urdu
    'ps', // Pashto
    'sd', // Sindhi
    'ug', // Uyghur
  ];

  const lowerCaseLocale = locale.toLowerCase();

  return rtlLocales.some((rtlLocale) => lowerCaseLocale.startsWith(rtlLocale));
};
