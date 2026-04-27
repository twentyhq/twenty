import { createI18nInstanceFactory } from 'twenty-shared/i18n';

import { messages as enMessages } from '@/locales/generated/en';

export const createI18nInstance = createI18nInstanceFactory({
  en: enMessages,
});
