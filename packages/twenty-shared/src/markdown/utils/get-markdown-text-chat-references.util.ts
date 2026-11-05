import { CHAT_REFERENCE_BODY_PATTERN } from '@/ai/constants/chat-reference-body-pattern.const';
import { isDefined } from '@/utils/validation/isDefined';
import { isEmptyObject } from '@/utils/validation/isEmptyObject';
import { Lexer, type Token } from 'marked';

type MarkdownTextChatReference = {
  fullMatch: string;
  index: number;
};

const CHAT_REFERENCE_PATTERN = new RegExp(
  `\\[\\[(?:${CHAT_REFERENCE_BODY_PATTERN})\\]\\]`,
  'g',
);

const PLACEHOLDER_START = String.fromCodePoint(0xe000);

const PLACEHOLDER_END = String.fromCodePoint(0xe001);

const PLACEHOLDER_PATTERN = new RegExp(
  `${PLACEHOLDER_START}(\\d+)${PLACEHOLDER_END}`,
  'g',
);

const PLACEHOLDER_DELIMITER_PATTERN = new RegExp(
  `[${PLACEHOLDER_START}${PLACEHOLDER_END}]`,
  'g',
);

const LINK_OR_HTML_SYNTAXES = ['<', ']('];

// Code blocks, HTML and links need one of these; a code span needs a backtick on each side of the placeholder.
const NON_TEXT_BLOCK_SYNTAXES = [
  '```',
  '~~~',
  ']:',
  '\t',
  '    ',
  ...LINK_OR_HTML_SYNTAXES,
];

const BACKTICK_RUN_OR_LINE_BREAK_PATTERN = /`+|\n/g;

const CARRIAGE_RETURN_PATTERN = /\r\n?/g;

const isBackslashEscaped = ({
  text,
  index,
}: {
  text: string;
  index: number;
}): boolean => {
  let backslashCount = 0;

  while (text[index - backslashCount - 1] === '\\') {
    backslashCount++;
  }

  return backslashCount % 2 === 1;
};

const getInlineTextRaws = (tokens: Token[]): string[] =>
  tokens.flatMap((token) => {
    if (token.type === 'text') {
      return [token.raw];
    }

    if (token.type === 'image') {
      return [];
    }

    return 'tokens' in token && isDefined(token.tokens)
      ? getInlineTextRaws(token.tokens)
      : [];
  });

const getPlaceholderIndexes = (text: string): number[] =>
  text.includes(PLACEHOLDER_START)
    ? Array.from(text.matchAll(PLACEHOLDER_PATTERN), ([, referenceIndex]) =>
        Number(referenceIndex),
      )
    : [];

const hasPlaceholderBetweenBackticks = (text: string): boolean =>
  text
    .slice(text.indexOf('`'), text.lastIndexOf('`'))
    .includes(PLACEHOLDER_START);

const isEveryBacktickRunClosedOnItsLine = (text: string): boolean => {
  let openRunLength = 0;

  for (const [match] of text.matchAll(BACKTICK_RUN_OR_LINE_BREAK_PATTERN)) {
    const isLineBreak = match === '\n';

    if (isLineBreak && openRunLength > 0) {
      return false;
    }

    if (isLineBreak) {
      continue;
    }

    if (openRunLength === 0) {
      openRunLength = match.length;
      continue;
    }

    if (match.length === openRunLength) {
      openRunLength = 0;
    }
  }

  return openRunLength === 0;
};

// When every backtick run closes on its own line, no code span crosses lines, so each line is checked alone.
const mayHidePlaceholders = (textWithPlaceholders: string): boolean => {
  if (
    NON_TEXT_BLOCK_SYNTAXES.some((syntax) =>
      textWithPlaceholders.includes(syntax),
    )
  ) {
    return true;
  }

  if (!textWithPlaceholders.includes('`')) {
    return false;
  }

  if (
    textWithPlaceholders.includes('\\`') ||
    !isEveryBacktickRunClosedOnItsLine(textWithPlaceholders)
  ) {
    return hasPlaceholderBetweenBackticks(textWithPlaceholders);
  }

  return textWithPlaceholders.split('\n').some(hasPlaceholderBetweenBackticks);
};

const getTextPlaceholderIndexes = (
  textWithPlaceholders: string,
): Set<number> => {
  const lexer = new Lexer();

  lexer.blockTokens(textWithPlaceholders, []);

  const hasLinkDefinitions = !isEmptyObject(lexer.tokens.links);

  return new Set(
    lexer.inlineQueue
      .filter(({ src }) => src.includes(PLACEHOLDER_START))
      .flatMap(({ src }) =>
        hasLinkDefinitions ||
        LINK_OR_HTML_SYNTAXES.some((syntax) => src.includes(syntax)) ||
        hasPlaceholderBetweenBackticks(src)
          ? getInlineTextRaws(lexer.inlineTokens(src))
          : [src],
      )
      .flatMap(getPlaceholderIndexes),
  );
};

// Delimiters already in the text become spaces, so the text cannot forge a placeholder
const replaceReferencesWithPlaceholders = ({
  text,
  references,
}: {
  text: string;
  references: MarkdownTextChatReference[];
}): string => {
  let textWithPlaceholders = '';
  let lastIndex = 0;

  for (const [referenceIndex, reference] of references.entries()) {
    textWithPlaceholders += `${text.slice(lastIndex, reference.index).replace(PLACEHOLDER_DELIMITER_PATTERN, ' ')}${PLACEHOLDER_START}${referenceIndex}${PLACEHOLDER_END}`;
    lastIndex = reference.index + reference.fullMatch.length;
  }

  return (
    textWithPlaceholders +
    text.slice(lastIndex).replace(PLACEHOLDER_DELIMITER_PATTERN, ' ')
  );
};

export const getMarkdownTextChatReferences = (
  text: string,
): MarkdownTextChatReference[] => {
  const references = Array.from(
    text.matchAll(CHAT_REFERENCE_PATTERN),
    ({ 0: fullMatch, index }) => ({ fullMatch, index }),
  ).filter(({ index }) => !isBackslashEscaped({ text, index }));

  if (references.length === 0) {
    return [];
  }

  const textWithPlaceholders = replaceReferencesWithPlaceholders({
    text,
    references,
  }).replace(CARRIAGE_RETURN_PATTERN, '\n');

  if (!mayHidePlaceholders(textWithPlaceholders)) {
    return references;
  }

  const textPlaceholderIndexes =
    getTextPlaceholderIndexes(textWithPlaceholders);

  return references.filter((_, referenceIndex) =>
    textPlaceholderIndexes.has(referenceIndex),
  );
};
