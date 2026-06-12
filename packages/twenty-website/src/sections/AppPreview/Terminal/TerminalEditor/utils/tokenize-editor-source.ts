import type { CodeLine, CodeToken } from '../types/editor-data.types';

const KEYWORDS = new Set([
  'import',
  'export',
  'default',
  'const',
  'let',
  'var',
  'from',
  'return',
  'if',
  'else',
  'function',
  'enum',
  'class',
  'type',
  'interface',
  'extends',
  'implements',
  'true',
  'false',
  'null',
  'undefined',
  'as',
  'new',
  'this',
  'typeof',
  'async',
  'await',
  'for',
  'of',
  'in',
  'switch',
  'case',
  'break',
  'continue',
  'throw',
]);

const tokenizeLine = (line: string): CodeLine => {
  const tokens: CodeToken[] = [];
  let textBuffer = '';
  let i = 0;

  const flushText = () => {
    if (textBuffer.length > 0) {
      tokens.push({ kind: 'text', value: textBuffer });
      textBuffer = '';
    }
  };

  const push = (token: CodeToken) => {
    flushText();
    tokens.push(token);
  };

  while (i < line.length) {
    const ch = line[i];

    if (ch === '/' && line[i + 1] === '/') {
      push({ kind: 'comment', value: line.slice(i) });
      i = line.length;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') {
          j += 2;
          continue;
        }
        if (line[j] === quote) {
          break;
        }
        j += 1;
      }
      push({ kind: 'string', value: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[\w$]/.test(line[j])) {
        j += 1;
      }
      const word = line.slice(i, j);

      if (KEYWORDS.has(word)) {
        push({ kind: 'keyword', value: word });
      } else if (/^[A-Z]/.test(word)) {
        push({ kind: 'identifier', value: word });
      } else {
        let k = j;
        while (k < line.length && line[k] === ' ') {
          k += 1;
        }
        if (line[k] === '(') {
          push({ kind: 'function', value: word });
        } else if (line[k] === ':') {
          push({ kind: 'property', value: word });
        } else {
          textBuffer += word;
        }
      }

      i = j;
      continue;
    }

    textBuffer += ch;
    i += 1;
  }

  flushText();
  return tokens;
};

export const tokenizeSource = (source: string): CodeLine[] =>
  source.split('\n').map(tokenizeLine);
