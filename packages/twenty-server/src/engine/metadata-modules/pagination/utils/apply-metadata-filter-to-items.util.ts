import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type MetadataFilterColumn } from 'src/engine/metadata-modules/pagination/types/metadata-filter-column.type';
import { type MetadataFilterComparison } from 'src/engine/metadata-modules/pagination/types/metadata-filter-comparison.type';
import { type MetadataFilterShape } from 'src/engine/metadata-modules/pagination/types/metadata-filter-shape.type';
import { normalizeMetadataFilterComparison } from 'src/engine/metadata-modules/pagination/utils/normalize-metadata-filter-comparison.util';

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
  const normalizedComparison = normalizeMetadataFilterComparison({
    comparison,
    column,
  });
  const normalizedValue =
    column.type === 'uuid' && typeof value === 'string'
      ? value.toLowerCase()
      : value;

  const stringValue =
    typeof normalizedValue === 'string' ? normalizedValue : undefined;
  const simpleComparisons: [
    keyof MetadataFilterComparison,
    (comparisonValue: unknown) => boolean,
  ][] = [
    ['eq', (comparisonValue) => normalizedValue === comparisonValue],
    ['neq', (comparisonValue) => normalizedValue !== comparisonValue],
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
    !normalizedComparison.in.includes(normalizedValue as string)
  ) {
    return false;
  }

  if (
    isDefined(normalizedComparison.notIn) &&
    normalizedComparison.notIn.includes(normalizedValue as string)
  ) {
    return false;
  }

  if (
    normalizedComparison.is !== undefined &&
    (normalizedComparison.is === null
      ? normalizedValue !== null && normalizedValue !== undefined
      : normalizedValue !== normalizedComparison.is)
  ) {
    return false;
  }

  if (
    normalizedComparison.isNot !== undefined &&
    (normalizedComparison.isNot === null
      ? normalizedValue === null || normalizedValue === undefined
      : normalizedValue === normalizedComparison.isNot)
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

      const value: unknown = Reflect.get(item, column.column);

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
