export const chunkArray = <T>(array: T[], chunkSize = 5): T[][] => {
  const chunkedArray: T[][] = [];
  let index = 0;

  while (index < array.length) {
    chunkedArray.push(array.slice(index, index + chunkSize));
    index += chunkSize;
  }

  return chunkedArray;
};
