const OPTIONAL_UNDEFINED_SUFFIX = ' | undefined';

export const normalizeDocumentationPropType = ({
  type,
  required,
}: {
  type: { name: string; value?: { value: string }[] };
  required: boolean;
}): string => {
  if (type.name === 'enum' && type.value !== undefined) {
    const values = type.value
      .map((option) => option.value)
      .filter((value) => required || value !== 'undefined');
    const hasOnlyNumericValues = values.every((value) =>
      Number.isFinite(Number(value)),
    );
    const orderedValues = hasOnlyNumericValues
      ? values.sort((left, right) => Number(left) - Number(right))
      : values;

    return orderedValues.join(' | ');
  }

  if (!required && type.name.endsWith(OPTIONAL_UNDEFINED_SUFFIX)) {
    return type.name.slice(0, -OPTIONAL_UNDEFINED_SUFFIX.length);
  }

  return type.name;
};
