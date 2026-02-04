export const splitFieldPath = (value: string) => {
  const dotIndex = value.indexOf('.');

  if (dotIndex === -1) {
    return { baseField: value, subFieldPath: undefined };
  }

  const baseField = value.slice(0, dotIndex).trim();
  const subFieldPath = value.slice(dotIndex + 1).trim();

  return { baseField, subFieldPath };
};
