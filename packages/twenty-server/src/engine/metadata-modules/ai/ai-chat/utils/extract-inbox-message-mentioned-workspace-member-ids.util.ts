import { Lexer, type Token, type Tokens } from 'marked';
import { extractRecordReferenceIds } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

const INLINE_CONTAINER_TOKEN_TYPES = new Set(['strong', 'em', 'del', 'link']);

const isListToken = (token: Token): token is Tokens.List =>
  token.type === 'list';

const isTableToken = (token: Token): token is Tokens.Table =>
  token.type === 'table';

const isInlineTextToken = (token: Token): token is Tokens.Text =>
  token.type === 'text' && !isDefined(token.tokens);

const readMentionText = (tokens: Token[]): string =>
  tokens.map(readTokenMentionText).join('');

const readBlocksMentionText = (blocks: { tokens: Token[] }[]): string =>
  blocks.map(({ tokens }) => `\n${readMentionText(tokens)}\n`).join('');

// Code, escapes and HTML read as a line break, which no reference can cross
const readTokenMentionText = (token: Token): string => {
  if (isInlineTextToken(token)) {
    return token.raw;
  }

  if (isListToken(token)) {
    return readBlocksMentionText(token.items);
  }

  if (isTableToken(token)) {
    return readBlocksMentionText([...token.header, ...token.rows.flat()]);
  }

  if (!('tokens' in token) || !isDefined(token.tokens)) {
    return '\n';
  }

  const text = readMentionText(token.tokens);

  return INLINE_CONTAINER_TOKEN_TYPES.has(token.type) ? text : `\n${text}\n`;
};

export const extractInboxMessageMentionedWorkspaceMemberIds = (
  text: string,
): string[] =>
  extractRecordReferenceIds({
    text: readMentionText(Lexer.lex(text)),
    objectNameSingular: 'workspaceMember',
  });
