import { QUOTE_HEADER_PATTERNS } from 'src/modules/messaging/message-import-manager/utils/quote-header-patterns.constant';

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

const splitTrailingAttribution = (line: string): string[] => {
  if (QUOTE_HEADER_PATTERNS.caretLine.test(line)) {
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

export const toAnalysableLines = (text: string): string[] =>
  maskWrappedLinks(text).split('\n').flatMap(splitTrailingAttribution);
