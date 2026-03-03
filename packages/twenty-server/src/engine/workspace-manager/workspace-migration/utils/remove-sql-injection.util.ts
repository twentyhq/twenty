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
