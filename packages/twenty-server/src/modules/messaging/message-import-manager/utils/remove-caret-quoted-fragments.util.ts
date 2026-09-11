import { isNonEmptyString } from '@sniptt/guards';
import EmailReplyParser from 'email-reply-parser';

export const removeCaretQuotedFragments = (text: string): string => {
  const withoutQuotations = new EmailReplyParser()
    .read(text)
    .getFragments()
    .filter((fragment) => !fragment.isQuoted())
    .map((fragment) => fragment.getContent())
    .join('\n');

  return isNonEmptyString(withoutQuotations.trim()) ? withoutQuotations : text;
};
