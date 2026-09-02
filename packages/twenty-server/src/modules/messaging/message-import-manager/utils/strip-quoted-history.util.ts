import { isNonEmptyString } from '@sniptt/guards';

import { QUOTE_HEADER_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/quote-header-patterns.constant';
import { describeCaretQuoting } from 'src/modules/messaging/message-import-manager/utils/describe-caret-quoting.util';
import { findQuoteHeaderIndex } from 'src/modules/messaging/message-import-manager/utils/find-quote-header-index.util';
import { removeCaretQuotedFragments } from 'src/modules/messaging/message-import-manager/utils/remove-caret-quoted-fragments.util';
import { removeSpaceStuffing } from 'src/modules/messaging/message-import-manager/utils/remove-space-stuffing.util';
import { toAnalysableLines } from 'src/modules/messaging/message-import-manager/utils/to-analysable-lines.util';

const CARET_LINES_MAKING_A_QUOTE = 3;
const NO_QUOTE_HEADER = -1;

const unmaskWrappedLinks = (text: string): string =>
  text.replace(QUOTE_HEADER_PATTERNS.maskedLink, '<$1>');

const keepEverything = (text: string): string => text.trim();

const cutBefore = (lines: string[], quoteHeaderIndex: number): string =>
  unmaskWrappedLinks(lines.slice(0, quoteHeaderIndex).join('\n').trim());

const quotingIsWorthCutting = (lines: string[]): boolean => {
  const caretQuoting = describeCaretQuoting(lines);

  return (
    caretQuoting.endsTheMessage ||
    caretQuoting.lineCount >= CARET_LINES_MAKING_A_QUOTE
  );
};

const writingResumesAfterTheQuote = (quotedLines: string[]): boolean => {
  const caretQuoting = describeCaretQuoting(quotedLines);

  return caretQuoting.lineCount > 0 && !caretQuoting.endsTheMessage;
};

export const stripQuotedHistory = (rawText: string): string => {
  const text = removeSpaceStuffing(rawText);
  const lines = toAnalysableLines(text);

  if (describeCaretQuoting(lines).hasWritingBetweenQuotedBlocks) {
    return keepEverything(text);
  }

  const quoteHeaderIndex = findQuoteHeaderIndex(lines);

  if (quoteHeaderIndex === NO_QUOTE_HEADER) {
    return quotingIsWorthCutting(lines)
      ? removeCaretQuotedFragments(text).trim()
      : keepEverything(text);
  }

  if (writingResumesAfterTheQuote(lines.slice(quoteHeaderIndex))) {
    return removeCaretQuotedFragments(text).trim();
  }

  const beforeQuoteHeader = cutBefore(lines, quoteHeaderIndex);

  return isNonEmptyString(beforeQuoteHeader)
    ? beforeQuoteHeader
    : keepEverything(text);
};
