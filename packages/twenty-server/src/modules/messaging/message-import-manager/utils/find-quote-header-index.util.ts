import { QUOTE_HEADER_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/quote-header-patterns.constant';

const QUOTE_HEADER_WINDOW_LINES = 4;
const SENDER_ADDRESS = /[\w.+-]+@[\w-]+\.[\w.]{2,}/;
const NO_QUOTE_HEADER = -1;

const withoutCaretPrefix = (line: string): string =>
  line.replace(/^\s*>+ ?/, '');

const windowFrom = (lines: string[], index: number): string[] =>
  lines.slice(index, index + QUOTE_HEADER_WINDOW_LINES).map(withoutCaretPrefix);

const opensAnUnambiguousQuote = (lines: string[], index: number): boolean => {
  const line = withoutCaretPrefix(lines[index]);
  const window = windowFrom(lines, index).join('\n');

  return (
    QUOTE_HEADER_PATTERNS.originalMessageBanner.test(line) ||
    QUOTE_HEADER_PATTERNS.datePersonAttribution.test(line) ||
    QUOTE_HEADER_PATTERNS.wroteAttribution.test(window) ||
    QUOTE_HEADER_PATTERNS.localizedAttributionLines.some((pattern) =>
      pattern.test(window),
    )
  );
};

const opensAHeaderBlock = (lines: string[], index: number): boolean => {
  if (
    !QUOTE_HEADER_PATTERNS.headerField.test(withoutCaretPrefix(lines[index]))
  ) {
    return false;
  }

  return windowFrom(lines, index).some((line) => SENDER_ADDRESS.test(line));
};

const opensAForwardedMessage = (line: string): boolean =>
  QUOTE_HEADER_PATTERNS.forwardedBanner.test(line);

const isPrecededOnlyByHeaderFields = (
  lines: string[],
  index: number,
): boolean =>
  lines
    .slice(0, index)
    .filter((line) => line.trim() !== '')
    .every((line) => QUOTE_HEADER_PATTERNS.headerField.test(line));

export const findQuoteHeaderIndex = (lines: string[]): number => {
  for (let index = 0; index < lines.length; index++) {
    if (opensAForwardedMessage(lines[index])) {
      return NO_QUOTE_HEADER;
    }

    if (opensAnUnambiguousQuote(lines, index)) {
      return index;
    }

    if (opensAHeaderBlock(lines, index)) {
      if (!isPrecededOnlyByHeaderFields(lines, index)) {
        return index;
      }
    }
  }

  return NO_QUOTE_HEADER;
};
