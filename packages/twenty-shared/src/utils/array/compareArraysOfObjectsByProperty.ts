export const compareArraysOfObjectsByProperty = <T, K extends keyof T>(
  arrayA: T[],
  arrayB: T[],
  property: K,
) => {
  return (
    arrayA.length !== arrayB.length ||
    arrayA.some(
      (item) => !arrayB.some((itemB) => itemB[property] === item[property]),
    ) ||
    arrayB.some(
      (item) => !arrayA.some((itemA) => itemA[property] === item[property]),
    )
  );
};
