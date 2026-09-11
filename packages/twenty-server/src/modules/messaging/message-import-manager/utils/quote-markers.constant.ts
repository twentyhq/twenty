export const QUOTE_MARKERS = {
  containerOpen: '\uE000',
  containerClose: '\uE001',
  splitter: '\uE002',
  repeatedSplitter: '\uE003',
  anyMarker: /[\uE000\uE001\uE002\uE003]/g,
} as const;
