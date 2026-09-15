import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type MetadataFilterColumn } from 'src/engine/metadata-modules/pagination/types/metadata-filter-column.type';
import { type MetadataFilterComparison } from 'src/engine/metadata-modules/pagination/types/metadata-filter-comparison.type';

const invertBooleanComparisonValue = (
  value: boolean | null | undefined,
): boolean | null | undefined => {
  if (typeof value === 'boolean') {
    return !value;
  }

  return value;
};

const lowercaseComparisonOperands = (
  comparison: MetadataFilterComparison,
): MetadataFilterComparison => {
  const lowercasedComparison: MetadataFilterComparison = { ...comparison };

  for (const operand of [
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'notLike',
    'iLike',
    'notILike',
  ] as const) {
    const value = lowercasedComparison[operand];

    if (isDefined(value)) {
      lowercasedComparison[operand] = value.toLowerCase();
    }
  }

  for (const operand of ['in', 'notIn'] as const) {
    const values = lowercasedComparison[operand];

    if (isDefined(values)) {
      lowercasedComparison[operand] = values.map((value) =>
        value.toLowerCase(),
      );
    }
  }

  return lowercasedComparison;
};

export const normalizeMetadataFilterComparison = ({
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

  if (column.type === 'uuid') {
    if (
      (normalizedComparison.is !== undefined &&
        normalizedComparison.is !== null) ||
      (normalizedComparison.isNot !== undefined &&
        normalizedComparison.isNot !== null)
    ) {
      throw new UserInputError(
        'UUID is/isNot comparisons only support null values',
      );
    }

    // Postgres compares uuid columns canonically, but the in-memory matcher
    // compares raw strings, so operands are lowercased to keep both paths
    // agreeing on differently-cased but equal ids.
    return lowercaseComparisonOperands(normalizedComparison);
  }

  return normalizedComparison;
};
