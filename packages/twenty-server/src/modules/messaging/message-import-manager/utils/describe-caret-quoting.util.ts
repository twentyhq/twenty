import { isNonEmptyString } from '@sniptt/guards';

import { type CaretQuoting } from 'src/modules/messaging/message-import-manager/types/caret-quoting.type';
import { QUOTE_HEADER_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/quote-header-patterns.constant';

const BARE_LINK_LINE = /\(https?:\/\//;

export const describeCaretQuoting = (lines: string[]): CaretQuoting => {
  let lineCount = 0;
  let seenQuotedBlock = false;
  let seenWritingAfterQuotedBlock = false;
  let hasWritingBetweenQuotedBlocks = false;
  let lastWrittenLineIsQuoted = false;

  for (const line of lines) {
    if (QUOTE_HEADER_PATTERNS.caretLine.test(line)) {
      lineCount += 1;
      lastWrittenLineIsQuoted = true;
      seenQuotedBlock = true;

      if (seenWritingAfterQuotedBlock) {
        hasWritingBetweenQuotedBlocks = true;
      }

      continue;
    }

    if (!isNonEmptyString(line)) {
      continue;
    }

    lastWrittenLineIsQuoted = false;

    if (seenQuotedBlock && !BARE_LINK_LINE.test(line)) {
      seenWritingAfterQuotedBlock = true;
    }
  }

  return {
    lineCount,
    endsTheMessage: lastWrittenLineIsQuoted,
    hasWritingBetweenQuotedBlocks,
  };
};
