export const throwIfNotDefined = <T>(
  value: T,
  variableName: string,
): asserts value is NonNullable<T> => {
  if (value === null || value === undefined) {
    throw new Error(
      `Value must be defined for variable ${variableName}, this should not happen`,
    );
  }
};
