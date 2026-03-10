export const filterDuplicatesById = <T extends { id: string }>(
  item: T,
  index: number,
  self: T[],
) => {
  return self.findIndex((i) => i.id === item.id) === index;
};
