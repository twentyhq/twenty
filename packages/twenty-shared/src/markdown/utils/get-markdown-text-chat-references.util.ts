import { CHAT_REFERENCE_BODY_PATTERN } from '@/ai/constants/chat-reference-body-pattern.const';
import { isDefined } from '@/utils/validation/isDefined';
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
  Array.from(text.matchAll(PLACEHOLDER_PATTERN), ([, referenceIndex]) =>
    Number(referenceIndex),
  );

const getTextPlaceholderIndexes = (
  textWithPlaceholders: string,
): Set<number> => {
  const lexer = new Lexer();

  lexer.blockTokens(textWithPlaceholders, []);

  return new Set(
    lexer.inlineQueue
      .map(({ src: inlineMarkdown }) => inlineMarkdown)
      .filter((inlineMarkdown) => inlineMarkdown.includes(PLACEHOLDER_START))
      .flatMap((inlineMarkdown) =>
        getInlineTextRaws(lexer.inlineTokens(inlineMarkdown)),
      )
      .flatMap(getPlaceholderIndexes),
  );
};

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

  const textPlaceholderIndexes = getTextPlaceholderIndexes(
    replaceReferencesWithPlaceholders({ text, references }).replace(
      CARRIAGE_RETURN_PATTERN,
      '\n',
    ),
  );

  return references.filter((_, referenceIndex) =>
    textPlaceholderIndexes.has(referenceIndex),
  );
};
