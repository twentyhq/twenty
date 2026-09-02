import { isNonEmptyString } from '@sniptt/guards';
import EmailReplyParser from 'email-reply-parser';

import { QUOTE_HEADER_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/quote-header-patterns.constant';

const QUOTE_HEADER_WINDOW_LINES = 4;
const CARET_LINE = /^\s*>/;
const BARE_LINK_LINE = /\(https?:\/\//;
const SPACE_STUFFED_LINE = /^ (>|From )/;
const CARET_LINES_MAKING_A_QUOTE = 3;

// RFC 3676 has senders prefix a space to any line opening with ">" or "From ".
const removeSpaceStuffing = (text: string): string =>
  text
    .split('\n')
    .map((line) => (SPACE_STUFFED_LINE.test(line) ? line.slice(1) : line))
    .join('\n');

const countCaretLines = (lines: string[]): number =>
  lines.filter((line) => CARET_LINE.test(line)).length;

const removeCaretQuotedFragments = (text: string): string => {
  const withoutQuotations = new EmailReplyParser()
    .read(text)
    .getFragments()
    .filter((fragment) => !fragment.isQuoted())
    .map((fragment) => fragment.getContent())
    .join('\n');

  return isNonEmptyString(withoutQuotations.trim()) ? withoutQuotations : text;
};

const maskWrappedLinks = (text: string): string =>
  text.replace(
    QUOTE_HEADER_PATTERNS.wrappedLink,
    (wrappedLink: string, url: string, linkIndex: number) => {
      const lineStart = text.lastIndexOf('\n', linkIndex);

      return lineStart > 0 && text[lineStart + 1] === '>'
        ? wrappedLink
        : `@@${url}@@`;
    },
  );

const unmaskWrappedLinks = (text: string): string =>
  text.replace(QUOTE_HEADER_PATTERNS.maskedLink, '<$1>');

const splitTrailingAttribution = (line: string): string[] => {
  if (CARET_LINE.test(line)) {
    return [line];
  }

  const attribution = line.match(
    QUOTE_HEADER_PATTERNS.wroteAttributionEndingLine,
  );

  if (attribution?.index === undefined || attribution.index === 0) {
    return [line];
  }

  return [line.slice(0, attribution.index), line.slice(attribution.index)];
};

const withoutCaretPrefix = (line: string): string =>
  line.replace(/^\s*>+ ?/, '');

const isQuoteHeaderAt = (lines: string[], index: number): boolean => {
  const line = withoutCaretPrefix(lines[index]);
  const window = lines
    .slice(index, index + QUOTE_HEADER_WINDOW_LINES)
    .map(withoutCaretPrefix)
    .join('\n');

  return (
    QUOTE_HEADER_PATTERNS.headerField.test(line) ||
    QUOTE_HEADER_PATTERNS.originalMessageBanner.test(line) ||
    QUOTE_HEADER_PATTERNS.datePersonAttribution.test(line) ||
    QUOTE_HEADER_PATTERNS.wroteAttribution.test(window) ||
    QUOTE_HEADER_PATTERNS.localizedAttributionLines.some((pattern) =>
      pattern.test(window),
    )
  );
};

const findQuoteHeaderIndex = (lines: string[]): number => {
  for (let index = 0; index < lines.length; index++) {
    if (QUOTE_HEADER_PATTERNS.forwardedBanner.test(lines[index])) {
      return -1;
    }

    if (isQuoteHeaderAt(lines, index)) {
      return index;
    }
  }

  return -1;
};

const isWrittenBetweenTwoQuotedBlocks = (lines: string[]): boolean => {
  let seenCaretLine = false;
  let seenAnswerAfterCaretLine = false;

  for (const line of lines) {
    if (CARET_LINE.test(line)) {
      if (seenAnswerAfterCaretLine) {
        return true;
      }

      seenCaretLine = true;
      continue;
    }

    if (seenCaretLine && isNonEmptyString(line) && !BARE_LINK_LINE.test(line)) {
      seenAnswerAfterCaretLine = true;
    }
  }

  return false;
};

const endsInsideCaretQuoting = (lines: string[]): boolean => {
  const lastWrittenLine = lines.filter(isNonEmptyString).at(-1);

  return lastWrittenLine !== undefined && CARET_LINE.test(lastWrittenLine);
};

export const stripQuotedHistory = (rawText: string): string => {
  const text = removeSpaceStuffing(rawText);
  const lines = maskWrappedLinks(text)
    .split('\n')
    .flatMap(splitTrailingAttribution);

  if (isWrittenBetweenTwoQuotedBlocks(lines)) {
    return text.trim();
  }

  const quoteHeaderIndex = findQuoteHeaderIndex(lines);

  if (quoteHeaderIndex === -1) {
    return endsInsideCaretQuoting(lines) ||
      countCaretLines(lines) >= CARET_LINES_MAKING_A_QUOTE
      ? removeCaretQuotedFragments(text).trim()
      : text.trim();
  }

  const quotedLines = lines.slice(quoteHeaderIndex);

  if (
    quotedLines.some((line) => CARET_LINE.test(line)) &&
    !endsInsideCaretQuoting(quotedLines)
  ) {
    return removeCaretQuotedFragments(text).trim();
  }

  const beforeQuoteHeader = lines.slice(0, quoteHeaderIndex).join('\n').trim();

  return isNonEmptyString(beforeQuoteHeader)
    ? unmaskWrappedLinks(beforeQuoteHeader)
    : text.trim();
};
