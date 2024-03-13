export const valuesStringForBatchRawQuery = (
  values: {
    [key: string]: any;
  }[],
  numberOfColumns: number,
  typesArray: string[] = [],
) => {
  const castedValues = values.reduce((acc, _, rowIndex) => {
    const rowValues = Array.from(
      { length: numberOfColumns },
      (_, columnIndex) => {
        const placeholder = `$${rowIndex * numberOfColumns + columnIndex + 1}`;
        const typeCast = typesArray[columnIndex]
          ? `::${typesArray[columnIndex]}`
          : '';

        return `${placeholder}${typeCast}`;
      },
    ).join(', ');

    acc.push(`(${rowValues})`);

    return acc;
  }, [] as string[]);

  return castedValues.join(', ');
};
