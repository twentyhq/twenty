import { type TextDirection } from '@/translations/types/TextDirection';

// RTL languages by ISO 639-1 subtag, beyond the shipped Arabic and Hebrew so enabling another in Crowdin
// does not lay the app out backwards.
const RIGHT_TO_LEFT_LANGUAGES = [
  'ar',
  'dv',
  'fa',
  'he',
  'ps',
  'sd',
  'ug',
  'ur',
  'yi',
];

export const getLocaleTextDirection = (locale: string): TextDirection =>
  RIGHT_TO_LEFT_LANGUAGES.includes(locale.split('-')[0] ?? locale)
    ? 'rtl'
    : 'ltr';
