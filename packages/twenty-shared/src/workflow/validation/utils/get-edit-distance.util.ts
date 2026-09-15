// Levenshtein edit distance
export const getEditDistance = (source: string, target: string): number => {
  const rowCount = source.length + 1;
  const columnCount = target.length + 1;

  const matrix: number[][] = Array.from({ length: rowCount }, () =>
    new Array<number>(columnCount).fill(0),
  );

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    matrix[rowIndex][0] = rowIndex;
  }

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    matrix[0][columnIndex] = columnIndex;
  }

  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
      const substitutionCost =
        source[rowIndex - 1] === target[columnIndex - 1] ? 0 : 1;

      matrix[rowIndex][columnIndex] = Math.min(
        matrix[rowIndex - 1][columnIndex] + 1,
        matrix[rowIndex][columnIndex - 1] + 1,
        matrix[rowIndex - 1][columnIndex - 1] + substitutionCost,
      );
    }
  }

  return matrix[source.length][target.length];
};
