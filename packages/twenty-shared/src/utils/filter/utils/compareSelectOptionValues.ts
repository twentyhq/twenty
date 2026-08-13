import { isDefined } from '@/utils/validation/isDefined';

// Select and rating columns are Postgres enums: the server compares them by
// enum definition order, which is the option position, not lexical order.
// Returns null when the comparison cannot be evaluated (null value, unknown
// option, missing option list), mirroring SQL NULL comparison semantics.
export const compareSelectOptionValues = ({
  value,
  comparisonValue,
  orderedOptionValues,
}: {
  value: string | null | undefined;
  comparisonValue: string;
  orderedOptionValues: string[] | undefined;
}): number | null => {
  if (!isDefined(value) || !isDefined(orderedOptionValues)) {
    return null;
  }

  const valueIndex = orderedOptionValues.indexOf(value);
  const comparisonValueIndex = orderedOptionValues.indexOf(comparisonValue);

  if (valueIndex === -1 || comparisonValueIndex === -1) {
    return null;
  }

  return valueIndex - comparisonValueIndex;
};
