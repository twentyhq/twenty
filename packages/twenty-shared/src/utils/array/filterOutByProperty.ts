export const filterOutByProperty = <T, K extends keyof T>(
  property: K,
  valueToExclude: T[K] | null | undefined,
) => {
  return (itemToFilter: T) => {
    return itemToFilter[property] !== valueToExclude;
  };
};
