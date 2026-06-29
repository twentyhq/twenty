import { defineConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';
import { DOCUMENTATION_DEFAULT_LANGUAGE } from 'twenty-shared/constants';

import { WEBSITE_LOCALE_LIST } from './src/platform/i18n/website-locale-list';

export default defineConfig({
  sourceLocale: DOCUMENTATION_DEFAULT_LANGUAGE,
  locales: [...WEBSITE_LOCALE_LIST],
  fallbackLocales: {
    default: DOCUMENTATION_DEFAULT_LANGUAGE,
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
