export const getUniqueValues = <TValue>(values: TValue[]): TValue[] => [
  ...new Set(values),
];
