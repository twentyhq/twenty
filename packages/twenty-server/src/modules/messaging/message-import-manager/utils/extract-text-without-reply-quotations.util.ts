import { isNonEmptyString } from '@sniptt/guards';
import EmailReplyParser from 'email-reply-parser';

export const extractTextWithoutReplyQuotations = (text: string): string => {
  const textWithoutQuotations = new EmailReplyParser()
    .read(text)
    .getFragments()
    .filter((fragment) => !fragment.isQuoted())
    .map((fragment) => fragment.getContent())
    .join('\n');

  return isNonEmptyString(textWithoutQuotations.trim())
    ? textWithoutQuotations
    : text;
};
