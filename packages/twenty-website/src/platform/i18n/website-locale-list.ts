import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'twenty-shared/translations';

// THE source of deployed website locales: URL segments, generateStaticParams,
// next.config rewrites, hreflang, and the sitemap all derive from this list.
// Adding a locale here fails the build until its compiled catalog is imported
// in messages-by-locale.ts.
export const WEBSITE_LOCALE_LIST: readonly AppLocale[] = [
  SOURCE_LOCALE,
  APP_LOCALES['fr-FR'],
  APP_LOCALES['es-ES'],
];
