import { REPLY_QUOTATION_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/reply-quotation-patterns.constant';

const SPLITTER_MAX_LINES = 4;
const MAX_LINE_LENGTH = 200000;

const STICKY_SPLITTERS = REPLY_QUOTATION_PATTERNS.splitters.map(
  (pattern) => new RegExp(pattern.source, `${pattern.flags}y`),
);

const matchSplitterAtLineStart = (chunk: string): string | null => {
  if (chunk.length > MAX_LINE_LENGTH) {
    return null;
  }

  for (const pattern of STICKY_SPLITTERS) {
    pattern.lastIndex = 0;

    const match = pattern.exec(chunk);

    if (match !== null) {
      return match[0];
    }
  }

  return null;
};

export const markMessageLines = (lines: string[]): string => {
  const markers = new Array<string>(lines.length);

  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim() === '') {
      markers[index] = 'e';
    } else if (REPLY_QUOTATION_PATTERNS.quotationMarker.test(line)) {
      markers[index] = 'm';
    } else if (REPLY_QUOTATION_PATTERNS.forwardedMessage.test(line)) {
      markers[index] = 'f';
    } else {
      const splitter = matchSplitterAtLineStart(
        lines.slice(index, index + SPLITTER_MAX_LINES).join('\n'),
      );

      if (splitter === null) {
        markers[index] = 't';
      } else {
        const splitterLineCount = splitter.split('\n').length;

        for (
          let offset = 0;
          offset <= splitterLineCount && index + offset < lines.length;
          offset++
        ) {
          markers[index + offset] = 's';
        }

        index += splitterLineCount - 1;
      }
    }

    index++;
  }

  return markers.join('');
};
