import { isNonEmptyString } from '@sniptt/guards';
import EmailReplyParser from 'email-reply-parser';

import { QUOTE_HEADER_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/quote-header-patterns.constant';

const QUOTE_HEADER_WINDOW_LINES = 4;

const removeCaretQuotedFragments = (text: string): string => {
  const withoutQuotations = new EmailReplyParser()
    .read(text)
    .getFragments()
    .filter((fragment) => !fragment.isQuoted())
    .map((fragment) => fragment.getContent())
    .join('\n');

  return isNonEmptyString(withoutQuotations.trim()) ? withoutQuotations : text;
};

const moveTrailingAttributionToOwnLine = (text: string): string =>
  text.replace(
    QUOTE_HEADER_PATTERNS.wroteAttributionEndingLine,
    (attribution: string, ...rest: unknown[]) => {
      const attributionIndex = rest.at(-2) as number;

      return attributionIndex > 0 && text[attributionIndex - 1] !== '\n'
        ? `\n${attribution}`
        : attribution;
    },
  );

const isQuoteHeaderAt = (lines: string[], index: number): boolean =>
  QUOTE_HEADER_PATTERNS.headerField.test(lines[index]) ||
  QUOTE_HEADER_PATTERNS.originalMessageBanner.test(lines[index]) ||
  QUOTE_HEADER_PATTERNS.datePersonAttribution.test(lines[index]) ||
  QUOTE_HEADER_PATTERNS.wroteAttribution.test(
    lines.slice(index, index + QUOTE_HEADER_WINDOW_LINES).join('\n'),
  );

const cutAtQuoteHeader = (text: string): string => {
  const lines = moveTrailingAttributionToOwnLine(text).split('\n');

  for (let index = 0; index < lines.length; index++) {
    if (QUOTE_HEADER_PATTERNS.forwardedBanner.test(lines[index])) {
      return text;
    }

    if (isQuoteHeaderAt(lines, index)) {
      const beforeQuoteHeader = lines.slice(0, index).join('\n').trim();

      return isNonEmptyString(beforeQuoteHeader) ? beforeQuoteHeader : text;
    }
  }

  return text;
};

export const stripQuotedHistory = (text: string): string =>
  cutAtQuoteHeader(removeCaretQuotedFragments(text)).trim();
