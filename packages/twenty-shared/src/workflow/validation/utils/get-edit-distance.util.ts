// Levenshtein edit distance
export const getEditDistance = (source: string, target: string): number => {
  const rowCount = source.length + 1;
  const columnCount = target.length + 1;

  // every index below is derived from the matrix's own dimensions, so the
  // non-null assertions are in bounds by construction
  const matrix: number[][] = Array.from({ length: rowCount }, () =>
    new Array<number>(columnCount).fill(0),
  );

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    matrix[rowIndex]![0] = rowIndex;
  }

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    matrix[0]![columnIndex] = columnIndex;
  }

  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    const previousRow = matrix[rowIndex - 1]!;
    const currentRow = matrix[rowIndex]!;

    for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
      const substitutionCost =
        source[rowIndex - 1] === target[columnIndex - 1] ? 0 : 1;

      currentRow[columnIndex] = Math.min(
        previousRow[columnIndex]! + 1,
        currentRow[columnIndex - 1]! + 1,
        previousRow[columnIndex - 1]! + substitutionCost,
      );
    }
  }

  return matrix[source.length]![target.length]!;
};
