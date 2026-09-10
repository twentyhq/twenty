import { isDefined } from '@/utils/validation/isDefined';

// Select and rating columns are Postgres enums: the server compares them by
// enum definition order, which is the option position, not lexical order.
// Returns null when the comparison cannot be evaluated (null value, unknown
// option, missing options), mirroring SQL NULL comparison semantics.
export const compareSelectOptionValues = ({
  value,
  comparisonValue,
  options,
}: {
  value: string | null | undefined;
  comparisonValue: string;
  options: { value: string; position: number }[] | null | undefined;
}): number | null => {
  if (!isDefined(value) || !isDefined(options)) {
    return null;
  }

  const orderedOptionValues = [...options]
    .sort((optionA, optionB) => optionA.position - optionB.position)
    .map((option) => option.value);

  const valueIndex = orderedOptionValues.indexOf(value);
  const comparisonValueIndex = orderedOptionValues.indexOf(comparisonValue);

  if (valueIndex === -1 || comparisonValueIndex === -1) {
    return null;
  }

  return valueIndex - comparisonValueIndex;
};
