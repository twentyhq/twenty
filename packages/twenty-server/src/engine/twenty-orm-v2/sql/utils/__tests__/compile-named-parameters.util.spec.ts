import { TwentyOrmV2Exception } from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { compileNamedParameters } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';

describe('compileNamedParameters', () => {
  it('should turn a named parameter into a positional placeholder', () => {
    const compiled = compileNamedParameters('"person"."name" = :name1a2b', {
      name1a2b: 'acme',
    });

    expect(compiled.text).toBe('"person"."name" = $1');
    expect(compiled.values).toEqual(['acme']);
  });

  it('should expand a spread parameter into one placeholder per item', () => {
    const compiled = compileNamedParameters('"id" IN (:...ids)', {
      ids: ['a', 'b', 'c'],
    });

    expect(compiled.text).toBe('"id" IN ($1, $2, $3)');
    expect(compiled.values).toEqual(['a', 'b', 'c']);
  });

  it('should bind a parameter referenced twice to a single placeholder', () => {
    const compiled = compileNamedParameters('"a" = :value OR "b" = :value', {
      value: 42,
    });

    expect(compiled.text).toBe('"a" = $1 OR "b" = $1');
    expect(compiled.values).toEqual([42]);
  });

  it('should not treat a cast as a parameter', () => {
    const compiled = compileNamedParameters(
      '"createdAt" < :cutoff::timestamptz + interval \'1 millisecond\'',
      { cutoff: '2026-01-01' },
    );

    expect(compiled.text).toBe(
      '"createdAt" < $1::timestamptz + interval \'1 millisecond\'',
    );
    expect(compiled.values).toEqual(['2026-01-01']);
  });

  it('should not treat a colon inside a string literal as a parameter', () => {
    const compiled = compileNamedParameters(`"label" = 'a:b' AND "id" = :id`, {
      id: 7,
    });

    expect(compiled.text).toBe(`"label" = 'a:b' AND "id" = $1`);
    expect(compiled.values).toEqual([7]);
  });

  it('should not treat a colon inside a quoted identifier as a parameter', () => {
    const compiled = compileNamedParameters('"weird:column" = :id', { id: 1 });

    expect(compiled.text).toBe('"weird:column" = $1');
    expect(compiled.values).toEqual([1]);
  });

  it('should handle doubled quotes inside a string literal', () => {
    const compiled = compileNamedParameters(
      `"note" = 'it''s here' AND "id" = :id`,
      { id: 1 },
    );

    expect(compiled.text).toBe(`"note" = 'it''s here' AND "id" = $1`);
    expect(compiled.values).toEqual([1]);
  });

  it('should throw when a referenced parameter was not provided', () => {
    expect(() => compileNamedParameters('"id" = :missing', {})).toThrow(
      TwentyOrmV2Exception,
    );
  });

  it('should expand an empty spread to NULL so it matches nothing', () => {
    // containsAny is not in ARRAY_OPERATORS, so the shared validation lets an empty list
    // through; NULL is valid in both "IN (NULL)" and "ARRAY[NULL]".
    const compiled = compileNamedParameters('"id" IN (:...ids)', { ids: [] });

    expect(compiled.text).toBe('"id" IN (NULL)');
    expect(compiled.values).toEqual([]);
  });

  it('should not let a spread item key collide with a caller parameter', () => {
    const compiled = compileNamedParameters(
      '"a" IN (:...ids) OR "z" = :ids__0',
      { ids: ['a', 'b'], ids__0: 99 },
    );

    expect(compiled.text).toBe('"a" IN ($1, $2) OR "z" = $3');
    expect(compiled.values).toEqual(['a', 'b', 99]);
  });

  it('should throw when a spread parameter is not an array', () => {
    expect(() =>
      compileNamedParameters('"id" IN (:...ids)', { ids: 'a' }),
    ).toThrow(TwentyOrmV2Exception);
  });

  it('should throw on an unterminated string literal', () => {
    expect(() => compileNamedParameters(`"a" = 'unterminated`, {})).toThrow(
      TwentyOrmV2Exception,
    );
  });

  it('should leave a value containing a placeholder-like string untouched', () => {
    const compiled = compileNamedParameters('"a" = :value', {
      value: ':notAParameter',
    });

    expect(compiled.text).toBe('"a" = $1');
    expect(compiled.values).toEqual([':notAParameter']);
  });
});
