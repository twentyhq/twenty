import { Brackets, type WhereExpressionBuilder } from 'typeorm';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  applyMetadataFilterToItems,
  applyMetadataFilterToQueryBuilder,
} from 'src/engine/metadata-modules/pagination/utils/apply-metadata-filter-to-query-builder.util';

class FakeWhereBuilder {
  conditions: string[] = [];
  parameters: Record<string, unknown> = {};

  andWhere(
    condition: string | Brackets,
    parameters?: Record<string, unknown>,
  ): this {
    this.append('AND', condition, parameters);

    return this;
  }

  orWhere(
    condition: string | Brackets,
    parameters?: Record<string, unknown>,
  ): this {
    this.append('OR', condition, parameters);

    return this;
  }

  render(): string {
    return this.conditions
      .map((condition, index) =>
        index === 0 ? condition.replace(/^(AND|OR) /, '') : condition,
      )
      .join(' ');
  }

  private append(
    operator: 'AND' | 'OR',
    condition: string | Brackets,
    parameters?: Record<string, unknown>,
  ): void {
    if (condition instanceof Brackets) {
      const nestedBuilder = new FakeWhereBuilder();

      condition.whereFactory(
        nestedBuilder as unknown as WhereExpressionBuilder,
      );
      this.conditions.push(`${operator} (${nestedBuilder.render()})`);
      Object.assign(this.parameters, nestedBuilder.parameters);
    } else {
      this.conditions.push(`${operator} ${condition}`);
      Object.assign(this.parameters, parameters ?? {});
    }
  }
}

const applyFilter = (
  filter: object,
  columnByFilterField: Parameters<
    typeof applyMetadataFilterToQueryBuilder
  >[0]['columnByFilterField'] = {
    id: { column: 'id', type: 'uuid' },
    isActive: { column: 'isActive', type: 'boolean' },
  },
) => {
  const whereBuilder = new FakeWhereBuilder();

  applyMetadataFilterToQueryBuilder({
    whereBuilder: whereBuilder as unknown as WhereExpressionBuilder,
    alias: 'entity',
    filter,
    columnByFilterField,
  });

  return whereBuilder;
};

describe('applyMetadataFilterToQueryBuilder', () => {
  it('translates eq comparisons into parameterized conditions', () => {
    const whereBuilder = applyFilter({ id: { eq: 'some-id' } });

    expect(whereBuilder.render()).toBe(
      '"entity"."id" = :metadataFilterParameter0',
    );
    expect(whereBuilder.parameters).toEqual({
      metadataFilterParameter0: 'some-id',
    });
  });

  it('combines multiple comparisons on one field with AND', () => {
    const whereBuilder = applyFilter({
      id: { gt: 'a', lt: 'b' },
    });

    expect(whereBuilder.render()).toBe(
      '"entity"."id" > :metadataFilterParameter0 AND "entity"."id" < :metadataFilterParameter1',
    );
  });

  it('translates in comparisons and renders an empty in as a false condition', () => {
    expect(applyFilter({ id: { in: ['a', 'b'] } }).render()).toBe(
      '"entity"."id" IN (:...metadataFilterParameter0)',
    );
    expect(applyFilter({ id: { in: [] } }).render()).toBe('1 = 0');
  });

  it('translates is and isNot including explicit null', () => {
    expect(applyFilter({ isActive: { is: true } }).render()).toBe(
      '"entity"."isActive" IS TRUE',
    );
    expect(applyFilter({ isActive: { is: null } }).render()).toBe(
      '"entity"."isActive" IS NULL',
    );
    expect(applyFilter({ isActive: { isNot: false } }).render()).toBe(
      '"entity"."isActive" IS NOT FALSE',
    );
  });

  it('inverts boolean values for columns flagged with invertBooleanValues', () => {
    const columnByFilterField = {
      isUIReadOnly: {
        column: 'isUIEditable',
        type: 'boolean',
        invertBooleanValues: true,
      },
    } as const;

    expect(
      applyFilter({ isUIReadOnly: { is: true } }, columnByFilterField).render(),
    ).toBe('"entity"."isUIEditable" IS FALSE');
    expect(
      applyFilter(
        { isUIReadOnly: { isNot: false } },
        columnByFilterField,
      ).render(),
    ).toBe('"entity"."isUIEditable" IS NOT TRUE');
    expect(
      applyFilter({ isUIReadOnly: { is: null } }, columnByFilterField).render(),
    ).toBe('"entity"."isUIEditable" IS NULL');
  });

  it('nests and groups with AND and or groups with OR', () => {
    const whereBuilder = applyFilter({
      and: [{ isActive: { is: true } }],
      or: [{ id: { eq: 'a' } }, { id: { eq: 'b' } }],
    });

    expect(whereBuilder.render()).toBe(
      '("entity"."isActive" IS TRUE) AND (("entity"."id" = :metadataFilterParameter0) OR ("entity"."id" = :metadataFilterParameter1))',
    );
  });

  it('supports nested and inside or', () => {
    const whereBuilder = applyFilter({
      or: [
        { and: [{ id: { eq: 'a' } }, { isActive: { is: false } }] },
        { id: { eq: 'b' } },
      ],
    });

    expect(whereBuilder.render()).toContain('IS FALSE');
    expect(Object.keys(whereBuilder.parameters)).toHaveLength(2);
  });

  it('rejects unknown filter fields', () => {
    expect(() => applyFilter({ unknownField: { eq: 'x' } })).toThrow(
      UserInputError,
    );
  });

  it('rejects boolean is operators on UUID columns before reaching postgres', () => {
    expect(() => applyFilter({ id: { is: true } })).toThrow(UserInputError);
  });

  it('normalizes UUID operands for database and in-memory filters', () => {
    type UuidFilter = {
      and?: UuidFilter[];
      or?: UuidFilter[];
      id?: { eq?: string; in?: string[] };
    };

    const lowerCaseUuid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const upperCaseUuid = lowerCaseUuid.toUpperCase();
    const filter: UuidFilter = {
      id: { eq: upperCaseUuid, in: [upperCaseUuid] },
    };
    const whereBuilder = applyFilter({
      id: { eq: upperCaseUuid, in: [upperCaseUuid] },
    });

    expect(whereBuilder.parameters).toEqual({
      metadataFilterParameter0: lowerCaseUuid,
      metadataFilterParameter1: [lowerCaseUuid],
    });
    expect(
      applyMetadataFilterToItems({
        items: [{ id: lowerCaseUuid }],
        filter,
        columnByFilterField: {
          id: { column: 'id', type: 'uuid' },
        },
      }),
    ).toEqual([{ id: lowerCaseUuid }]);
  });

  it('applies the same filter semantics to batched in-memory relations', () => {
    type TestFilter = {
      and?: TestFilter[];
      id?: { gt?: string; lt?: string };
      isActive?: { is?: boolean };
    };

    const items = [
      { id: 'a', isActive: true },
      { id: 'b', isActive: false },
      { id: 'c', isActive: true },
    ];

    expect(
      applyMetadataFilterToItems<(typeof items)[number], TestFilter>({
        items,
        filter: {
          and: [{ isActive: { is: true } }],
          id: { gt: 'a', lt: 'c' },
        },
        columnByFilterField: {
          id: { column: 'id', type: 'uuid' },
          isActive: { column: 'isActive', type: 'boolean' },
        },
      }),
    ).toEqual([]);
  });

  it('matches uuid filters regardless of operand casing', () => {
    type UuidFilter = {
      and?: UuidFilter[];
      or?: UuidFilter[];
      id?: { eq?: string; neq?: string; in?: string[]; notIn?: string[] };
    };

    const items = [{ id: '00000000-0000-4000-8000-00000000000a' }];
    const columnByFilterField = {
      id: { column: 'id', type: 'uuid' },
    } as const;
    const upperCasedId = items[0].id.toUpperCase();

    const matching = (filter: UuidFilter) =>
      applyMetadataFilterToItems<(typeof items)[number], UuidFilter>({
        items,
        filter,
        columnByFilterField,
      });

    expect(matching({ id: { eq: upperCasedId } })).toEqual(items);
    expect(matching({ id: { in: [upperCasedId] } })).toEqual(items);
    expect(matching({ id: { neq: upperCasedId } })).toEqual([]);
    expect(matching({ id: { notIn: [upperCasedId] } })).toEqual([]);
  });

  it('ignores undefined filter values', () => {
    const whereBuilder = applyFilter({ id: undefined });

    expect(whereBuilder.conditions).toHaveLength(0);
  });
});
