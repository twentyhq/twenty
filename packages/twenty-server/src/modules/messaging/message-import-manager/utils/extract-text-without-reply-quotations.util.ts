import { isNonEmptyString } from '@sniptt/guards';
import EmailReplyParser from 'email-reply-parser';

import { stripReplyQuotations } from 'src/modules/messaging/message-import-manager/utils/strip-reply-quotations.util';

export const extractTextWithoutReplyQuotations = (text: string): string => {
  const withoutSplitters = stripReplyQuotations(text);

  const textWithoutQuotations = new EmailReplyParser()
    .read(withoutSplitters)
    .getFragments()
    .filter((fragment) => !fragment.isQuoted())
    .map((fragment) => fragment.getContent())
    .join('\n');

  return isNonEmptyString(textWithoutQuotations.trim())
    ? textWithoutQuotations
    : withoutSplitters;
};
