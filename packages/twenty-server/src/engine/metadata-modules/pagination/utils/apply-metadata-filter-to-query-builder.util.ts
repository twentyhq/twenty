import { isDefined } from 'twenty-shared/utils';
import { Brackets, type WhereExpressionBuilder } from 'typeorm';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type MetadataFilterColumn } from 'src/engine/metadata-modules/pagination/types/metadata-filter-column.type';
import { type MetadataFilterComparison } from 'src/engine/metadata-modules/pagination/types/metadata-filter-comparison.type';
import { type MetadataFilterShape } from 'src/engine/metadata-modules/pagination/types/metadata-filter-shape.type';
import { normalizeMetadataFilterComparison } from 'src/engine/metadata-modules/pagination/utils/normalize-metadata-filter-comparison.util';

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
    const comparison = normalizeMetadataFilterComparison({
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
