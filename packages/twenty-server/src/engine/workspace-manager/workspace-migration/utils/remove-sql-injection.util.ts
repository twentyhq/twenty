// Strips all characters except [a-zA-Z0-9_].
// Use ONLY for generating safe identifier names (e.g. enum names from table+column).
// For SQL escaping, use escapeIdentifier or escapeLiteral instead.
export const removeSqlDDLInjection = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9_]/g, '');
};

// PostgreSQL standard identifier quoting: wraps in double quotes and
// doubles any internal double-quote characters.
// e.g. my"table → "my""table"
export const escapeIdentifier = (identifier: string): string => {
  if (identifier.includes('\0')) {
    throw new Error('Null bytes are not allowed in PostgreSQL identifiers');
  }

  return '"' + identifier.replace(/"/g, '""') + '"';
};

const FORBIDDEN_TS_VECTOR_EXPRESSION_TOKENS = ['\0', ';', '--', '/*', '*/'];

const hasBalancedParentheses = (expression: string): boolean => {
  let depth = 0;
  let isInsideStringLiteral = false;

  for (let index = 0; index < expression.length; index++) {
    const character = expression[index];

    if (isInsideStringLiteral) {
      if (character === "'") {
        if (expression[index + 1] === "'") {
          index++;
        } else {
          isInsideStringLiteral = false;
        }
      }
      continue;
    }

    if (character === "'") {
      isInsideStringLiteral = true;
    } else if (character === '(') {
      depth++;
    } else if (character === ')') {
      depth--;

      if (depth < 0) {
        return false;
      }
    }
  }

  return depth === 0 && !isInsideStringLiteral;
};

// Returns true when a tsvector expression is safe to inline into generated-column DDL.
// Intentionally exposes a boolean only: the specific failure reason is never surfaced, so a
// caller cannot use the error as an oracle to probe the filter. Callers use this for validation;
// the DDL sink uses assertSafeTsVectorExpression below as a hard last-resort guard.
export const isSafeTsVectorExpression = (expression: string): boolean => {
  const hasForbiddenToken = FORBIDDEN_TS_VECTOR_EXPRESSION_TOKENS.some(
    (token) => expression.includes(token),
  );

  if (hasForbiddenToken) {
    return false;
  }

  return hasBalancedParentheses(expression);
};

export const assertSafeTsVectorExpression = (expression: string): void => {
  if (!isSafeTsVectorExpression(expression)) {
    throw new Error('Unsafe tsvector expression detected');
  }
};

// PostgreSQL standard literal quoting: wraps in single quotes and
// doubles any internal single-quote characters. Prefixes with E when
// backslashes are present (standard_conforming_strings safety).
// e.g. it's → 'it''s'
export const escapeLiteral = (value: string): string => {
  if (value.includes('\0')) {
    throw new Error('Null bytes are not allowed in PostgreSQL string literals');
  }

  let hasBackslash = false;
  let escaped = "'";

  for (const char of value) {
    if (char === "'") {
      escaped += "''";
    } else if (char === '\\') {
      escaped += '\\\\';
      hasBackslash = true;
    } else {
      escaped += char;
    }
  }

  escaped += "'";

  if (hasBackslash) {
    escaped = 'E' + escaped;
  }

  return escaped;
};
