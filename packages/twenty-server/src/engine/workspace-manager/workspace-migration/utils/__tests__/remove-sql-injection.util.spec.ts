import {
  escapeIdentifier,
  escapeLiteral,
  removeSqlDDLInjection,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

describe('removeSqlDDLInjection', () => {
  it('should strip non-alphanumeric/underscore characters', () => {
    expect(removeSqlDDLInjection('my_table')).toBe('my_table');
    expect(removeSqlDDLInjection('table"name')).toBe('tablename');
    expect(removeSqlDDLInjection('drop;--')).toBe('drop');
  });
});

describe('escapeIdentifier', () => {
  it('should wrap identifier in double quotes', () => {
    expect(escapeIdentifier('myTable')).toBe('"myTable"');
  });

  it('should double internal double-quote characters', () => {
    expect(escapeIdentifier('my"table')).toBe('"my""table"');
    expect(escapeIdentifier('a""b')).toBe('"a""""b"');
  });

  it('should handle empty string', () => {
    expect(escapeIdentifier('')).toBe('""');
  });

  it('should handle single-quote characters without modification', () => {
    expect(escapeIdentifier("it's")).toBe('"it\'s"');
  });

  it('should reject null bytes', () => {
    expect(() => escapeIdentifier('my\0table')).toThrow(
      'Null bytes are not allowed in PostgreSQL identifiers',
    );
  });

  it('should handle SQL injection attempts in identifiers', () => {
    expect(escapeIdentifier('"; DROP TABLE users; --')).toBe(
      '"""; DROP TABLE users; --"',
    );
  });
});

describe('escapeLiteral', () => {
  it('should wrap value in single quotes', () => {
    expect(escapeLiteral('hello')).toBe("'hello'");
  });

  it('should double internal single-quote characters', () => {
    expect(escapeLiteral("it's")).toBe("'it''s'");
    expect(escapeLiteral("a''b")).toBe("'a''''b'");
  });

  it('should handle empty string', () => {
    expect(escapeLiteral('')).toBe("''");
  });

  it('should escape backslashes and add E prefix', () => {
    expect(escapeLiteral('test\\value')).toBe("E'test\\\\value'");
  });

  it('should handle both single quotes and backslashes', () => {
    expect(escapeLiteral("it's a \\path")).toBe("E'it''s a \\\\path'");
  });

  it('should not add E prefix when no backslashes present', () => {
    expect(escapeLiteral('simple')).toBe("'simple'");
    expect(escapeLiteral("it's")).toBe("'it''s'");
  });

  it('should reject null bytes', () => {
    expect(() => escapeLiteral('my\0value')).toThrow(
      'Null bytes are not allowed in PostgreSQL string literals',
    );
  });

  it('should handle SQL injection attempts in literals', () => {
    expect(escapeLiteral("'; DROP TABLE users; --")).toBe(
      "'''; DROP TABLE users; --'",
    );
  });

  it('should handle double quotes without modification', () => {
    expect(escapeLiteral('test"value')).toBe("'test\"value'");
  });
});
