export type SpokenLanguage =
  | 'ENGLISH'
  | 'FRENCH'
  | 'GERMAN'
  | 'CHINESE'
  | 'SPANISH'
  | 'ARABIC'
  | 'BENGALI'
  | 'CATALAN'
  | 'CZECH'
  | 'DANISH'
  | 'DUTCH'
  | 'FARSI'
  | 'FINNISH'
  | 'GREEK'
  | 'HINDI'
  | 'INDONESIAN'
  | 'ITALIAN'
  | 'JAPANESE'
  | 'KOREAN'
  | 'MALAY'
  | 'NORWEGIAN'
  | 'POLISH'
  | 'PORTUGUESE'
  | 'PUNJABI'
  | 'ROMANIAN'
  | 'RUSSIAN'
  | 'SWAHILI'
  | 'SWEDISH'
  | 'TAGALOG'
  | 'TAMIL'
  | 'THAI'
  | 'TURKISH'
  | 'UKRAINIAN'
  | 'URDU'
  | 'VIETNAMESE';

// Mirrors the Partner.languagesSpoken MULTI_SELECT in the twenty-partners CRM
// (the source of truth). Unknown values still render via the chip-row
// title-case fallback, so a missed sync only loses the translated label.
export const SPOKEN_LANGUAGES: readonly SpokenLanguage[] = [
  'ENGLISH',
  'FRENCH',
  'GERMAN',
  'CHINESE',
  'SPANISH',
  'ARABIC',
  'BENGALI',
  'CATALAN',
  'CZECH',
  'DANISH',
  'DUTCH',
  'FARSI',
  'FINNISH',
  'GREEK',
  'HINDI',
  'INDONESIAN',
  'ITALIAN',
  'JAPANESE',
  'KOREAN',
  'MALAY',
  'NORWEGIAN',
  'POLISH',
  'PORTUGUESE',
  'PUNJABI',
  'ROMANIAN',
  'RUSSIAN',
  'SWAHILI',
  'SWEDISH',
  'TAGALOG',
  'TAMIL',
  'THAI',
  'TURKISH',
  'UKRAINIAN',
  'URDU',
  'VIETNAMESE',
];
