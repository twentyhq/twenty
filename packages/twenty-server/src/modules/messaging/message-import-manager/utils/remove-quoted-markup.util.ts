import { QUOTE_MARKERS } from 'src/modules/messaging/message-import-manager/utils/quote-markers.constant';

const holdsNothingButMarkers = (text: string): boolean =>
  text.replace(QUOTE_MARKERS.anyMarker, '').trim() === '';

const removeMarkedContainers = (markedText: string): string => {
  const kept: string[] = [];
  let depth = 0;

  for (const character of markedText) {
    if (character === QUOTE_MARKERS.containerOpen) {
      depth += 1;
      continue;
    }

    if (character === QUOTE_MARKERS.containerClose) {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (depth === 0) {
      kept.push(character);
    }
  }

  const withoutContainers = kept.join('');

  return holdsNothingButMarkers(withoutContainers)
    ? markedText
    : withoutContainers;
};

const indexOfSecondOccurrence = (text: string, marker: string): number => {
  const first = text.indexOf(marker);

  return first === -1 ? -1 : text.indexOf(marker, first + 1);
};

const findSplitterIndex = (markedText: string): number => {
  const splitterIndexes = [
    markedText.indexOf(QUOTE_MARKERS.splitter),
    indexOfSecondOccurrence(markedText, QUOTE_MARKERS.repeatedSplitter),
  ].filter((index) => index !== -1);

  return splitterIndexes.length === 0 ? -1 : Math.min(...splitterIndexes);
};

const cutAtSplitter = (markedText: string): string => {
  const splitterIndex = findSplitterIndex(markedText);

  if (splitterIndex === -1) {
    return markedText;
  }

  const beforeSplitter = markedText.slice(0, splitterIndex);

  return holdsNothingButMarkers(beforeSplitter) ? markedText : beforeSplitter;
};

export const removeQuotedMarkup = (markedText: string): string =>
  cutAtSplitter(removeMarkedContainers(markedText)).replace(
    QUOTE_MARKERS.anyMarker,
    '',
  );
