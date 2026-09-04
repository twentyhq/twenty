import { isNonEmptyString } from '@sniptt/guards';
import EmailReplyParser from 'email-reply-parser';

const danishReplyHeaderRegex =
  /(?:^|\r?\n)(?:_{5,}|-{5,})\r?\nFra:.*\r?\nSendt:.*\r?\nTil:.*(?:\r?\n[ \t]+.*)*(?:\r?\n(?:Cc|Bcc):.*(?:\r?\n[ \t]+.*)*)*\r?\nEmne:.*/i;

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
