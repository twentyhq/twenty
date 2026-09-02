import { REPLY_QUOTATION_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/reply-quotation-patterns.constant';

const FORWARDED_MESSAGE_MARKERS = /^[te]*f/;
const REPEATED_QUOTATION_MARKERS = /(me*){3}/;
const INLINE_REPLY_MARKERS = /m(?=e*(t[te]*)m)/g;
const SPLITTER_FOLLOWED_BY_TEXT_MARKERS = /(se*)+((t|f)+e*)+/g;

const isInlineReplyLink = ({
  lines,
  index,
}: {
  lines: string[];
  index: number;
}): boolean => {
  const previousLine = lines[index - 1];
  const currentLine = lines[index];

  if (previousLine !== undefined) {
    if (REPLY_QUOTATION_PATTERNS.parenthesisLink.test(previousLine)) {
      return true;
    }
  }

  return (
    currentLine !== undefined &&
    currentLine.trim().search(REPLY_QUOTATION_PATTERNS.parenthesisLink) === 0
  );
};

const hasNonLinkInlineReply = ({
  lines,
  markers,
}: {
  lines: string[];
  markers: string;
}): boolean => {
  INLINE_REPLY_MARKERS.lastIndex = 0;

  let match = INLINE_REPLY_MARKERS.exec(markers);

  while (match !== null) {
    const index = markers.indexOf(match[1], match.index);

    if (index === -1 || !isInlineReplyLink({ lines, index })) {
      return true;
    }

    match = INLINE_REPLY_MARKERS.exec(markers);
  }

  return false;
};

export const processMarkedLines = ({
  lines,
  markers,
}: {
  lines: string[];
  markers: string;
}): { lines: string[]; firstDeletedLine: number; lastDeletedLine: number } => {
  const keepAll = {
    lines,
    firstDeletedLine: -1,
    lastDeletedLine: -1,
  };

  const effectiveMarkers =
    !markers.includes('s') && !REPEATED_QUOTATION_MARKERS.test(markers)
      ? markers.replace(/m/g, 't')
      : markers;

  if (FORWARDED_MESSAGE_MARKERS.test(effectiveMarkers)) {
    return keepAll;
  }

  if (hasNonLinkInlineReply({ lines, markers: effectiveMarkers })) {
    return keepAll;
  }

  SPLITTER_FOLLOWED_BY_TEXT_MARKERS.lastIndex = 0;

  const splitterMatch =
    SPLITTER_FOLLOWED_BY_TEXT_MARKERS.exec(effectiveMarkers);

  if (splitterMatch !== null) {
    return {
      lines: lines.slice(0, splitterMatch.index),
      firstDeletedLine: splitterMatch.index,
      lastDeletedLine: lines.length,
    };
  }

  const quotationMatch =
    REPLY_QUOTATION_PATTERNS.quotation.exec(effectiveMarkers) ??
    REPLY_QUOTATION_PATTERNS.emptyQuotation.exec(effectiveMarkers);

  if (quotationMatch !== null) {
    const quotationEnd = quotationMatch.index + quotationMatch[1].length;

    return {
      lines: lines
        .slice(0, quotationMatch.index)
        .concat(lines.slice(quotationEnd)),
      firstDeletedLine: quotationMatch.index,
      lastDeletedLine: quotationEnd,
    };
  }

  return keepAll;
};
