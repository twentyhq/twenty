export const mapById = <T extends { id: string }>(itemToMap: T) => {
  return itemToMap.id;
};
