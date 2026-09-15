import { type Messages } from '@lingui/core';
import { type DocumentationSupportedLanguage } from 'twenty-shared/constants';

import { messages as arMessages } from '@/locales/generated/ar';
import { messages as csMessages } from '@/locales/generated/cs';
import { messages as deMessages } from '@/locales/generated/de';
import { messages as enMessages } from '@/locales/generated/en';
import { messages as esMessages } from '@/locales/generated/es';
import { messages as frMessages } from '@/locales/generated/fr';
import { messages as itMessages } from '@/locales/generated/it';
import { messages as jaMessages } from '@/locales/generated/ja';
import { messages as koMessages } from '@/locales/generated/ko';
import { messages as ptMessages } from '@/locales/generated/pt';
import { messages as roMessages } from '@/locales/generated/ro';
import { messages as ruMessages } from '@/locales/generated/ru';
import { messages as trMessages } from '@/locales/generated/tr';
import { messages as zhMessages } from '@/locales/generated/zh';

export const MESSAGES_BY_LOCALE: Record<
  DocumentationSupportedLanguage,
  Messages
> = {
  en: enMessages,
  fr: frMessages,
  ar: arMessages,
  cs: csMessages,
  de: deMessages,
  es: esMessages,
  it: itMessages,
  ja: jaMessages,
  ko: koMessages,
  pt: ptMessages,
  ro: roMessages,
  ru: ruMessages,
  tr: trMessages,
  zh: zhMessages,
};
