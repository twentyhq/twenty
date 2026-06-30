import { DOCUMENTATION_DEFAULT_LANGUAGE } from './DocumentationDefaultLanguage';

export const DOCUMENTATION_SUPPORTED_LANGUAGES = [
  DOCUMENTATION_DEFAULT_LANGUAGE,
  'fr',
  'ar',
  'cs',
  'de',
  'es',
  'it',
  'ja',
  'ko',
  'pt',
  'ro',
  'ru',
  'tr',
  'zh',
] as const;

export type DocumentationSupportedLanguage =
  (typeof DOCUMENTATION_SUPPORTED_LANGUAGES)[number];
