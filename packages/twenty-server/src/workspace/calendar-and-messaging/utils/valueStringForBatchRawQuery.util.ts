export const valuesStringForBatchRawQuery = (values: any[]): string => {
  return values
    .map((_, row) => {
      values
        .map((_, index) => {
          return `$${row * values.length + index + 1}`;
        })
        .join(', ');
    })
    .join(', ');
};
