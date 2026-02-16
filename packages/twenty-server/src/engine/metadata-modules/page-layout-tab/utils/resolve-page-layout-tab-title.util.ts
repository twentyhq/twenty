import { type I18n } from '@lingui/core';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';

export const resolvePageLayoutTabTitle = (
  title: string,
  i18nInstance: I18n,
): string => {
  const messageId = generateMessageId(title);
  const translatedMessage = i18nInstance._(messageId);

  if (translatedMessage === messageId) {
    return title;
  }

  return translatedMessage;
};
