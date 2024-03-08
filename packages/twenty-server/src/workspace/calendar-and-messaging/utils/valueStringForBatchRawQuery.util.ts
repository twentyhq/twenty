export const valuesStringForBatchRawQuery = (
  values: {
    [key: string]: any;
  }[],
): string => {
  return values
    .map((_, row) => {
      return `(${Object.keys(values[0])
        .map((_, index) => {
          return `$${row * Object.keys(values[0]).length + index + 1}`;
        })
        .join(', ')})`;
    })
    .join(', ');
};
