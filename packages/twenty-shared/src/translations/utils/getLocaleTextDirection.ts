import { type TextDirection } from '@/translations/types/TextDirection';

// Scripts written right to left, by ISO 639-1 language subtag. Twenty ships
// Arabic, Persian, and Hebrew today; the rest are listed so that ticking one
// of them in Crowdin does not silently lay the app out backwards.
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
  RIGHT_TO_LEFT_LANGUAGES.includes(locale.split('-')[0]) ? 'rtl' : 'ltr';
