import { Lexer, type Token, type Tokens } from 'marked';
import {
  CHAT_REFERENCE_BODY_PATTERN,
  extractRecordReferenceIds,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

const REFERENCE_PATTERN = new RegExp(
  `\\[\\[(?:${CHAT_REFERENCE_BODY_PATTERN})\\]\\]`,
  'g',
);

const REFERENCE_PLACEHOLDER_START = String.fromCodePoint(0xe000);

const REFERENCE_PLACEHOLDER_END = String.fromCodePoint(0xe001);

const REFERENCE_PLACEHOLDER_PATTERN = new RegExp(
  `${REFERENCE_PLACEHOLDER_START}(\\d+)${REFERENCE_PLACEHOLDER_END}`,
  'g',
);

const REFERENCE_PLACEHOLDER_DELIMITER_PATTERN = new RegExp(
  `[${REFERENCE_PLACEHOLDER_START}${REFERENCE_PLACEHOLDER_END}]`,
  'g',
);

const isListToken = (token: Token): token is Tokens.List =>
  token.type === 'list';

const isTableToken = (token: Token): token is Tokens.Table =>
  token.type === 'table';

const isInlineTextToken = (token: Token): token is Tokens.Text =>
  token.type === 'text' && !isDefined(token.tokens);

const isEscapedAt = ({
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

const readMentionText = (tokens: Token[]): string =>
  tokens.map(readTokenMentionText).join('');

// Code, escapes and HTML read as nothing, so a reference there mentions no one
const readTokenMentionText = (token: Token): string => {
  if (isInlineTextToken(token)) {
    return token.raw;
  }

  if (isListToken(token)) {
    return readMentionText(token.items);
  }

  if (isTableToken(token)) {
    return [...token.header, ...token.rows.flat()]
      .map(({ tokens }) => readMentionText(tokens))
      .join('');
  }

  return 'tokens' in token && isDefined(token.tokens)
    ? readMentionText(token.tokens)
    : '';
};

export const extractInboxMessageMentionedWorkspaceMemberIds = (
  text: string,
): string[] => {
  const references: string[] = [];
  // Delimiters already in the text become spaces, so the text cannot forge a placeholder
  const messageText = text.replace(
    REFERENCE_PLACEHOLDER_DELIMITER_PATTERN,
    ' ',
  );

  // Set aside before Markdown is read, as the renderer does, so a label keeps any character
  const textWithPlaceholders = messageText.replace(
    REFERENCE_PATTERN,
    (reference: string, index: number) => {
      if (isEscapedAt({ text: messageText, index })) {
        return reference;
      }

      references.push(reference);

      return `${REFERENCE_PLACEHOLDER_START}${references.length - 1}${REFERENCE_PLACEHOLDER_END}`;
    },
  );
  const mentionedReferences = [
    ...readMentionText(Lexer.lex(textWithPlaceholders)).matchAll(
      REFERENCE_PLACEHOLDER_PATTERN,
    ),
  ]
    .map(([, referenceIndex]) => references[Number(referenceIndex)])
    .filter(isDefined);

  return extractRecordReferenceIds({
    text: mentionedReferences.join('\n'),
    objectNameSingular: 'workspaceMember',
  });
};
