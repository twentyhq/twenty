import { QUOTE_HEADER_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/quote-header-patterns.constant';

const QUOTE_HEADER_WINDOW_LINES = 4;
const NO_QUOTE_HEADER = -1;

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

const opensAForwardedMessage = (line: string): boolean =>
  QUOTE_HEADER_PATTERNS.forwardedBanner.test(line);

export const findQuoteHeaderIndex = (lines: string[]): number => {
  for (let index = 0; index < lines.length; index++) {
    if (opensAForwardedMessage(lines[index])) {
      return NO_QUOTE_HEADER;
    }

    if (isQuoteHeaderAt(lines, index)) {
      return index;
    }
  }

  return NO_QUOTE_HEADER;
};
