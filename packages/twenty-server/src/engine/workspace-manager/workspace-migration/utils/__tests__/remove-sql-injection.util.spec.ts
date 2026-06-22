import {
  assertSafeTsVectorExpression,
  escapeIdentifier,
  escapeLiteral,
  isSafeTsVectorExpression,
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

describe('assertSafeTsVectorExpression', () => {
  it('should accept a real server-generated tsvector expression', () => {
    const generated = `to_tsvector('simple', COALESCE(public.unaccent_immutable("name"), '') || ' ' || COALESCE("emailsPrimaryEmail"::text, ''))`;

    expect(() => assertSafeTsVectorExpression(generated)).not.toThrow();
  });

  it('should reject expressions containing a statement terminator', () => {
    expect(() =>
      assertSafeTsVectorExpression(
        `to_tsvector('simple', coalesce("name", ''))) STORED; CREATE TABLE core."x" (a text); --`,
      ),
    ).toThrow('Unsafe tsvector expression detected');
  });

  it('should reject expressions containing a line comment', () => {
    expect(() =>
      assertSafeTsVectorExpression(`to_tsvector('simple', '') -- comment`),
    ).toThrow('Unsafe tsvector expression detected');
  });

  it('should reject expressions containing a block comment', () => {
    expect(() =>
      assertSafeTsVectorExpression(`to_tsvector('simple', '') /* comment */`),
    ).toThrow('Unsafe tsvector expression detected');
  });

  it('should reject null bytes', () => {
    expect(() =>
      assertSafeTsVectorExpression(`to_tsvector('simple', '\0')`),
    ).toThrow('Unsafe tsvector expression detected');
  });

  it('should reject a parenthesis-balanced clause-injection that uses no forbidden token', () => {
    // Closes the wrapping AS( early and injects a sibling ADD COLUMN clause - no ";" or comment.
    expect(() =>
      assertSafeTsVectorExpression(
        `to_tsvector('simple', coalesce("x",''))) STORED, ADD COLUMN "evil" text GENERATED ALWAYS AS (to_tsvector('simple', '')`,
      ),
    ).toThrow('Unsafe tsvector expression detected');
  });

  it('should reject dollar-quoting used to smuggle a breakout parenthesis', () => {
    // PostgreSQL treats the quotes inside $$...$$ as literal text, so a single-quote-only scanner
    // would skip the real ) between the two dollar-quoted segments and miscount it as balanced.
    expect(() =>
      assertSafeTsVectorExpression(
        `to_tsvector('simple', $$'$$ ) STORED, ADD COLUMN "evil" text $$'$$`,
      ),
    ).toThrow('Unsafe tsvector expression detected');
  });

  it('should reject a double-quoted-identifier desync that hides a breakout parenthesis', () => {
    // PostgreSQL reads "'" as identifiers (named '), so the middle ) is real code that breaks out.
    // A single-quote-only scanner instead treats that ) as inside a string literal and accepts it.
    expect(() => assertSafeTsVectorExpression(`"'")"'"`)).toThrow(
      'Unsafe tsvector expression detected',
    );
  });
});

describe('isSafeTsVectorExpression', () => {
  it('should return true for a safe generated expression', () => {
    expect(
      isSafeTsVectorExpression(
        `to_tsvector('simple', COALESCE(public.unaccent_immutable("name"), ''))`,
      ),
    ).toBe(true);
  });

  it('should accept balanced parentheses that appear inside string literals', () => {
    expect(
      isSafeTsVectorExpression(
        `to_tsvector('simple', regexp_replace("x"::text, '"(a|b)"\\s*:\\s*', '', 'g'))`,
      ),
    ).toBe(true);
    expect(isSafeTsVectorExpression(`COALESCE("x", ')')`)).toBe(true);
  });

  it('should accept parentheses that appear inside a double-quoted identifier', () => {
    expect(isSafeTsVectorExpression(`COALESCE("weird)name", '')`)).toBe(true);
  });

  it('should reject expressions with a forbidden token', () => {
    expect(isSafeTsVectorExpression(`to_tsvector('simple', '') ; DROP`)).toBe(
      false,
    );
  });

  it('should reject any expression containing a dollar sign', () => {
    expect(isSafeTsVectorExpression(`to_tsvector('simple', $$x$$)`)).toBe(
      false,
    );
  });

  it('should reject expressions with unbalanced parentheses', () => {
    expect(isSafeTsVectorExpression(`coalesce("x", '')) STORED`)).toBe(false);
  });
});
