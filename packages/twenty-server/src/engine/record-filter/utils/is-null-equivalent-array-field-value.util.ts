export const isNullEquivalentArrayFieldValue = (value: unknown): boolean => {
  return (Array.isArray(value) && value.length === 0) || value === null;
};
