export const mapByProperty =
  <T extends { id: string }>(propertyName: keyof T) =>
  (itemToMap: T) => {
    return itemToMap[propertyName];
  };
