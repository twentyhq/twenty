import { defineConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { WEBSITE_LOCALE_LIST } from './src/lib/i18n/utils/website-locale-list';

export default defineConfig({
  sourceLocale: SOURCE_LOCALE,
  locales: [...WEBSITE_LOCALE_LIST],
  fallbackLocales: {
    default: SOURCE_LOCALE,
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}',
      include: ['src'],
    },
  ],
  catalogsMergePath: '<rootDir>/src/locales/generated/{locale}',
  compileNamespace: 'ts',
  format: formatter({ lineNumbers: false, printLinguiId: true }),
});
