import { type APP_LOCALES } from 'twenty-shared/translations';

import { type MessageIdTranslator } from 'src/engine/metadata-modules/utils/message-id-translator.type';

export type EffectiveEntityI18nContext = {
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: MessageIdTranslator;
  isStandardApp: boolean;
  applicationCatalog?: Record<string, string>;
};
