export const valuesStringForBatchRawQuery = (
  values: {
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    [key: string]: any;
  }[],
  typesArray: string[] = [],
) => {
  const castedValues = values.reduce((acc, _, rowIndex) => {
    const numberOfColumns = typesArray.length;

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
