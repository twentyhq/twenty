import { convertNamedParametersToPositional } from 'src/engine/record-share/utils/convert-named-parameters-to-positional.util';

describe('convertNamedParametersToPositional', () => {
  it('should number parameters in order of appearance', () => {
    expect(
      convertNamedParametersToPositional({
        sql: '"r"."name" ILIKE :name1 AND "r"."stage" = :stage2',
        parameters: { stage2: 'OPEN', name1: '%acme%' },
      }),
    ).toEqual({
      sql: '"r"."name" ILIKE $1 AND "r"."stage" = $2',
      values: ['%acme%', 'OPEN'],
    });
  });

  it('should reuse the same placeholder for a repeated name', () => {
    expect(
      convertNamedParametersToPositional({
        sql: 'RIGHT("r"."name", LENGTH(:suffix)) = :suffix',
        parameters: { suffix: 'Inc' },
      }),
    ).toEqual({
      sql: 'RIGHT("r"."name", LENGTH($1)) = $1',
      values: ['Inc'],
    });
  });

  it('should expand a spread list into one placeholder per value', () => {
    expect(
      convertNamedParametersToPositional({
        sql: '"r"."stage" IN (:...stages) AND "r"."tags" @> ARRAY[:...stages]',
        parameters: { stages: ['OPEN', 'WON'] },
      }),
    ).toEqual({
      sql: '"r"."stage" IN ($1, $2) AND "r"."tags" @> ARRAY[$1, $2]',
      values: ['OPEN', 'WON'],
    });
  });

  it('should leave casts and unknown names untouched', () => {
    expect(
      convertNamedParametersToPositional({
        sql: '"r"."closedAt" < :closedAt::timestamptz AND "r"."id" = :unknown',
        parameters: { closedAt: '2026-01-01T00:00:00.000Z' },
      }),
    ).toEqual({
      sql: '"r"."closedAt" < $1::timestamptz AND "r"."id" = :unknown',
      values: ['2026-01-01T00:00:00.000Z'],
    });
  });
});
