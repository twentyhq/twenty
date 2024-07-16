export const valuesStringForBatchRawQuery = (
  values: {
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

export const getFlattenedValuesAndValuesStringForBatchRawQuery = (
  values: {
    [key: string]: any;
  }[],
  keyTypeMap: {
    [key: string]: string;
  },
): {
  flattenedValues: any[];
  valuesString: string;
} => {
  const keysToInsert = Object.keys(keyTypeMap);

  const flattenedValues = values.flatMap((value) =>
    keysToInsert.map((key) => value[key]),
  );

  const valuesString = valuesStringForBatchRawQuery(
    values,
    Object.values(keyTypeMap),
  );

  return {
    flattenedValues,
    valuesString,
  };
};
