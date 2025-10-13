export const getContiguousIncrementalValues = (
  numberOfValues: number,
  startingValue = 0,
) => {
  return Array.from(
    { length: numberOfValues },
    (_, index) => startingValue + index,
  );
};
