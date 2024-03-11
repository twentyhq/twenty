export const valuesStringForBatchRawQuery = (
  values: {
    [key: string]: any;
  }[],
  numberOfColumns: number,
): string => {
  return values
    .map((_, row) => {
      let value = '';

      for (let index = 0; index < numberOfColumns; index++) {
        value += `$${row * numberOfColumns + index + 1}, `;
      }

      return `(${value.slice(0, -2)})`;
    })
    .join(', ');
};
