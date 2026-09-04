import { isNonEmptyString } from '@sniptt/guards';
import EmailReplyParser from 'email-reply-parser';

const danishReplyHeaderRegex =
  /(?:^|\r?\n)Fra:.*\r?\nSendt:.*\r?\nTil:.*\r?\nEmne:.*/i;

export const extractTextWithoutReplyQuotations = (text: string): string => {
  const danishReplyHeaderMatch = text.match(danishReplyHeaderRegex);

  const textWithoutDanishReplyQuotation =
    danishReplyHeaderMatch?.index !== undefined
      ? text.slice(0, danishReplyHeaderMatch.index)
      : text;

  const textWithoutQuotations = new EmailReplyParser()
    .read(textWithoutDanishReplyQuotation)
    .getFragments()
    .filter((fragment) => !fragment.isQuoted())
    .map((fragment) => fragment.getContent())
    .join('\n');

  return isNonEmptyString(textWithoutQuotations.trim())
    ? textWithoutQuotations
    : text;
};
