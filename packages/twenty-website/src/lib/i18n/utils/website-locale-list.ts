import {
  APP_LOCALES,
  SOURCE_LOCALE,
  type AppLocale,
} from 'twenty-shared/translations';

// Website localization is intentionally rolled out separately from the app.
// Keep this allowlist small until Crowdin sync, SEO signals, and QA are proven.
export const WEBSITE_LOCALE_LIST = [
  SOURCE_LOCALE,
  APP_LOCALES['fr-FR'],
] as const satisfies readonly AppLocale[];
