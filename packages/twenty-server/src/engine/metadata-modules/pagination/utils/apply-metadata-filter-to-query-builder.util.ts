import { isDefined } from 'twenty-shared/utils';
import { Brackets, type WhereExpressionBuilder } from 'typeorm';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export type MetadataFilterComparison = {
  eq?: unknown;
  neq?: unknown;
  gt?: unknown;
  gte?: unknown;
  lt?: unknown;
  lte?: unknown;
  like?: unknown;
  notLike?: unknown;
  iLike?: unknown;
  notILike?: unknown;
  in?: unknown[];
  notIn?: unknown[];
  is?: boolean | null;
  isNot?: boolean | null;
};

// invertBooleanValues supports deprecated boolean aliases whose backing
// column has the opposite meaning (isUIReadOnly filters run against
// isUIEditable, since the legacy column is no longer written).
export type MetadataFilterColumn =
  | { column: string; type: 'uuid' }
  | { column: string; type: 'boolean'; invertBooleanValues?: true };

type MetadataFilterShape<TFilter> = {
  and?: TFilter[];
  or?: TFilter[];
};

type ParameterCounter = { value: number };

const buildBooleanCondition = (
  column: string,
  operator: 'IS' | 'IS NOT',
  value: boolean | null,
): string => {
  if (value === null) {
    return `${column} ${operator} NULL`;
  }

  return `${column} ${operator} ${value ? 'TRUE' : 'FALSE'}`;
};

const invertBooleanComparisonValue = (
  value: boolean | null | undefined,
): boolean | null | undefined => {
  if (typeof value === 'boolean') {
    return !value;
  }

  return value;
};

const normalizeMetadataComparison = ({
  comparison,
  column,
}: {
  comparison: MetadataFilterComparison;
  column: MetadataFilterColumn;
}): MetadataFilterComparison => {
  const normalizedComparison = { ...comparison };

  if (column.type === 'boolean' && column.invertBooleanValues) {
    normalizedComparison.is = invertBooleanComparisonValue(comparison.is);
    normalizedComparison.isNot = invertBooleanComparisonValue(comparison.isNot);
  }

  if (
    column.type === 'uuid' &&
    ((normalizedComparison.is !== undefined &&
      normalizedComparison.is !== null) ||
      (normalizedComparison.isNot !== undefined &&
        normalizedComparison.isNot !== null))
  ) {
    throw new UserInputError(
      'UUID is/isNot comparisons only support null values',
    );
  }

  return normalizedComparison;
};

const applyComparisonToQueryBuilder = ({
  whereBuilder,
  column,
  comparison,
  parameterCounter,
}: {
  whereBuilder: WhereExpressionBuilder;
  column: string;
  comparison: MetadataFilterComparison;
  parameterCounter: ParameterCounter;
}): void => {
  const nextParameterName = () =>
    `metadataFilterParameter${parameterCounter.value++}`;

  const simpleOperators: Partial<
    Record<keyof MetadataFilterComparison, string>
  > = {
    eq: '=',
    neq: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
  };

  for (const [comparisonKey, sqlOperator] of Object.entries(simpleOperators)) {
    const value = comparison[comparisonKey as keyof MetadataFilterComparison];

    if (isDefined(value)) {
      const parameterName = nextParameterName();

      whereBuilder.andWhere(`${column} ${sqlOperator} :${parameterName}`, {
        [parameterName]: value,
      });
    }
  }

  const likeOperators: Partial<Record<keyof MetadataFilterComparison, string>> =
    {
      like: 'LIKE',
      notLike: 'NOT LIKE',
      iLike: 'ILIKE',
      notILike: 'NOT ILIKE',
    };

  for (const [comparisonKey, sqlOperator] of Object.entries(likeOperators)) {
    const value = comparison[comparisonKey as keyof MetadataFilterComparison];

    if (isDefined(value)) {
      const parameterName = nextParameterName();

      whereBuilder.andWhere(
        `${column}::text ${sqlOperator} :${parameterName}`,
        {
          [parameterName]: value,
        },
      );
    }
  }

  if (isDefined(comparison.in)) {
    if (comparison.in.length === 0) {
      whereBuilder.andWhere('1 = 0');
    } else {
      const parameterName = nextParameterName();

      whereBuilder.andWhere(`${column} IN (:...${parameterName})`, {
        [parameterName]: comparison.in,
      });
    }
  }

  if (isDefined(comparison.notIn) && comparison.notIn.length > 0) {
    const parameterName = nextParameterName();

    whereBuilder.andWhere(`${column} NOT IN (:...${parameterName})`, {
      [parameterName]: comparison.notIn,
    });
  }

  if (comparison.is !== undefined) {
    whereBuilder.andWhere(
      buildBooleanCondition(column, 'IS', comparison.is ?? null),
    );
  }

  if (comparison.isNot !== undefined) {
    whereBuilder.andWhere(
      buildBooleanCondition(column, 'IS NOT', comparison.isNot ?? null),
    );
  }
};

// Translates a nestjs-query style filter ({ and, or, field: { eq, in, ... } })
// into TypeORM query builder conditions. Top-level field conditions, `and`
// entries and separate comparisons on one field are combined with AND; `or`
// groups are bracketed and combined with OR.
export const applyMetadataFilterToQueryBuilder = <
  TFilter extends MetadataFilterShape<TFilter>,
>({
  whereBuilder,
  alias,
  filter,
  columnByFilterField,
  parameterCounter = { value: 0 },
}: {
  whereBuilder: WhereExpressionBuilder;
  alias: string;
  filter: TFilter;
  columnByFilterField: Record<string, MetadataFilterColumn>;
  parameterCounter?: ParameterCounter;
}): void => {
  for (const [filterField, filterValue] of Object.entries(filter)) {
    if (!isDefined(filterValue)) {
      continue;
    }

    if (filterField === 'and') {
      for (const subFilter of filterValue as TFilter[]) {
        whereBuilder.andWhere(
          new Brackets((subWhereBuilder) =>
            applyMetadataFilterToQueryBuilder({
              whereBuilder: subWhereBuilder,
              alias,
              filter: subFilter,
              columnByFilterField,
              parameterCounter,
            }),
          ),
        );
      }
      continue;
    }

    if (filterField === 'or') {
      whereBuilder.andWhere(
        new Brackets((orWhereBuilder) => {
          for (const subFilter of filterValue as TFilter[]) {
            orWhereBuilder.orWhere(
              new Brackets((subWhereBuilder) =>
                applyMetadataFilterToQueryBuilder({
                  whereBuilder: subWhereBuilder,
                  alias,
                  filter: subFilter,
                  columnByFilterField,
                  parameterCounter,
                }),
              ),
            );
          }
        }),
      );
      continue;
    }

    const filterColumn = columnByFilterField[filterField];

    if (!isDefined(filterColumn)) {
      throw new UserInputError(`Unknown filter field: ${filterField}`);
    }

    const { column } = filterColumn;
    const comparison = normalizeMetadataComparison({
      comparison: filterValue as MetadataFilterComparison,
      column: filterColumn,
    });

    applyComparisonToQueryBuilder({
      whereBuilder,
      column: `"${alias}"."${column}"`,
      comparison,
      parameterCounter,
    });
  }
};

const matchesSqlLikePattern = (value: string, pattern: string): boolean => {
  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regularExpressionPattern = escapedPattern
    .replace(/%/g, '.*')
    .replace(/_/g, '.');

  return new RegExp(`^${regularExpressionPattern}$`).test(value);
};

const matchesMetadataComparison = ({
  value,
  comparison,
  column,
}: {
  value: unknown;
  comparison: MetadataFilterComparison;
  column: MetadataFilterColumn;
}): boolean => {
  const normalizedComparison = normalizeMetadataComparison({
    comparison,
    column,
  });

  const stringValue = typeof value === 'string' ? value : undefined;
  const simpleComparisons: [
    keyof MetadataFilterComparison,
    (comparisonValue: unknown) => boolean,
  ][] = [
    ['eq', (comparisonValue) => value === comparisonValue],
    ['neq', (comparisonValue) => value !== comparisonValue],
    [
      'gt',
      (comparisonValue) =>
        isDefined(stringValue) &&
        typeof comparisonValue === 'string' &&
        stringValue > comparisonValue,
    ],
    [
      'gte',
      (comparisonValue) =>
        isDefined(stringValue) &&
        typeof comparisonValue === 'string' &&
        stringValue >= comparisonValue,
    ],
    [
      'lt',
      (comparisonValue) =>
        isDefined(stringValue) &&
        typeof comparisonValue === 'string' &&
        stringValue < comparisonValue,
    ],
    [
      'lte',
      (comparisonValue) =>
        isDefined(stringValue) &&
        typeof comparisonValue === 'string' &&
        stringValue <= comparisonValue,
    ],
  ];

  for (const [comparisonKey, matches] of simpleComparisons) {
    const comparisonValue = normalizedComparison[comparisonKey];

    if (isDefined(comparisonValue) && !matches(comparisonValue)) {
      return false;
    }
  }

  const likeComparisons: [keyof MetadataFilterComparison, boolean, boolean][] =
    [
      ['like', false, false],
      ['notLike', false, true],
      ['iLike', true, false],
      ['notILike', true, true],
    ];

  for (const [comparisonKey, caseInsensitive, negate] of likeComparisons) {
    const comparisonValue = normalizedComparison[comparisonKey];

    if (!isDefined(comparisonValue)) {
      continue;
    }

    if (!isDefined(stringValue) || typeof comparisonValue !== 'string') {
      return false;
    }

    const candidate = caseInsensitive ? stringValue.toLowerCase() : stringValue;
    const pattern = caseInsensitive
      ? comparisonValue.toLowerCase()
      : comparisonValue;
    const matches = matchesSqlLikePattern(candidate, pattern);

    if (negate ? matches : !matches) {
      return false;
    }
  }

  if (
    isDefined(normalizedComparison.in) &&
    !normalizedComparison.in.includes(value)
  ) {
    return false;
  }

  if (
    isDefined(normalizedComparison.notIn) &&
    normalizedComparison.notIn.includes(value)
  ) {
    return false;
  }

  if (
    normalizedComparison.is !== undefined &&
    (normalizedComparison.is === null
      ? value !== null && value !== undefined
      : value !== normalizedComparison.is)
  ) {
    return false;
  }

  if (
    normalizedComparison.isNot !== undefined &&
    (normalizedComparison.isNot === null
      ? value === null || value === undefined
      : value === normalizedComparison.isNot)
  ) {
    return false;
  }

  return true;
};

export const applyMetadataFilterToItems = <
  TEntity extends { id: string },
  TFilter extends MetadataFilterShape<TFilter>,
>({
  items,
  filter,
  columnByFilterField,
}: {
  items: TEntity[];
  filter: TFilter;
  columnByFilterField: Record<string, MetadataFilterColumn>;
}): TEntity[] =>
  items.filter((item) => {
    for (const [filterField, filterValue] of Object.entries(filter)) {
      if (!isDefined(filterValue)) {
        continue;
      }

      if (filterField === 'and') {
        if (
          !(filterValue as TFilter[]).every(
            (subFilter) =>
              applyMetadataFilterToItems({
                items: [item],
                filter: subFilter,
                columnByFilterField,
              }).length === 1,
          )
        ) {
          return false;
        }

        continue;
      }

      if (filterField === 'or') {
        const subFilters = filterValue as TFilter[];

        if (
          subFilters.length > 0 &&
          !subFilters.some(
            (subFilter) =>
              applyMetadataFilterToItems({
                items: [item],
                filter: subFilter,
                columnByFilterField,
              }).length === 1,
          )
        ) {
          return false;
        }

        continue;
      }

      const column = columnByFilterField[filterField];

      if (!isDefined(column)) {
        throw new UserInputError(`Unknown filter field: ${filterField}`);
      }

      const value = (item as unknown as Record<string, unknown>)[column.column];

      if (
        !matchesMetadataComparison({
          value,
          comparison: filterValue as MetadataFilterComparison,
          column,
        })
      ) {
        return false;
      }
    }

    return true;
  });
