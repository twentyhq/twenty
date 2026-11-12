import {
  Brackets,
  type ObjectLiteral,
  type WhereExpressionBuilder,
} from 'typeorm';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { applyMetadataFilterToQueryBuilder } from 'src/engine/metadata-modules/pagination/utils/apply-metadata-filter-to-query-builder.util';

type WhereCondition =
  | string
  | Brackets
  | ObjectLiteral
  | ObjectLiteral[]
  | ((queryBuilder: WhereExpressionBuilder) => string);

class FakeWhereBuilder implements WhereExpressionBuilder {
  conditions: string[] = [];
  parameters: Record<string, unknown> = {};

  where(): this {
    throw new Error('Not used by applyMetadataFilterToQueryBuilder');
  }

  andWhere(condition: WhereCondition, parameters?: ObjectLiteral): this {
    this.append('AND', condition, parameters);

    return this;
  }

  orWhere(condition: WhereCondition, parameters?: ObjectLiteral): this {
    this.append('OR', condition, parameters);

    return this;
  }

  whereInIds(): this {
    throw new Error('Not used by applyMetadataFilterToQueryBuilder');
  }

  andWhereInIds(): this {
    throw new Error('Not used by applyMetadataFilterToQueryBuilder');
  }

  orWhereInIds(): this {
    throw new Error('Not used by applyMetadataFilterToQueryBuilder');
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
    condition: WhereCondition,
    parameters?: ObjectLiteral,
  ): void {
    if (condition instanceof Brackets) {
      const nestedBuilder = new FakeWhereBuilder();

      condition.whereFactory(nestedBuilder);
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
    whereBuilder,
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

  it('normalizes UUID operands for database filters', () => {
    const lowerCaseUuid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const upperCaseUuid = lowerCaseUuid.toUpperCase();
    const whereBuilder = applyFilter({
      id: { eq: upperCaseUuid, in: [upperCaseUuid] },
    });

    expect(whereBuilder.parameters).toEqual({
      metadataFilterParameter0: lowerCaseUuid,
      metadataFilterParameter1: [lowerCaseUuid],
    });
  });

  it('ignores undefined filter values', () => {
    const whereBuilder = applyFilter({ id: undefined });

    expect(whereBuilder.conditions).toHaveLength(0);
  });
});
