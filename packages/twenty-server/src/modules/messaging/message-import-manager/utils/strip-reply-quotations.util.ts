import { isNonEmptyString } from '@sniptt/guards';

import { markMessageLines } from 'src/modules/messaging/message-import-manager/utils/mark-message-lines.util';
import { processMarkedLines } from 'src/modules/messaging/message-import-manager/utils/process-marked-lines.util';
import { REPLY_QUOTATION_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/reply-quotation-patterns.constant';

const MAX_LINES_COUNT = 1000;
const MAX_LINE_LENGTH = 200000;

const maskLinkBrackets = (text: string): string =>
  text.replace(
    REPLY_QUOTATION_PATTERNS.link,
    (entireMatch: string, url: string, matchIndex: number) => {
      const lineStart = text.lastIndexOf('\n', matchIndex);

      return lineStart > 0 && text[lineStart + 1] === '>'
        ? entireMatch
        : `@@${url}@@`;
    },
  );

const breakLineBeforeSplitter = (text: string, delimiter: string): string => {
  if (text.length >= MAX_LINE_LENGTH) {
    return text;
  }

  return text.replace(
    REPLY_QUOTATION_PATTERNS.onDateSomebodyWrote,
    (entireMatch: string, ...rest: unknown[]) => {
      const matchIndex = rest.at(-2) as number;

      return matchIndex > 0 && text[matchIndex - 1] !== '\n'
        ? `${delimiter}${entireMatch}`
        : entireMatch;
    },
  );
};

const getDelimiter = (text: string): string =>
  text.includes('\r\n') ? '\r\n' : '\n';

export const stripReplyQuotations = (text: string): string => {
  const delimiter = getDelimiter(text);
  const preprocessed = breakLineBeforeSplitter(
    maskLinkBrackets(text),
    delimiter,
  );
  const lines = preprocessed.split(delimiter);

  if (lines.length > MAX_LINES_COUNT) {
    return text;
  }

  const { lines: keptLines } = processMarkedLines({
    lines,
    markers: markMessageLines(lines),
  });

  const stripped = keptLines
    .join(delimiter)
    .replace(REPLY_QUOTATION_PATTERNS.normalizedLink, '<$1>')
    .trim();

  return isNonEmptyString(stripped) ? stripped : text;
};
