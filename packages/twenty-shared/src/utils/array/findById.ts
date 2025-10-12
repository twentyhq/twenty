export const findById = <T extends { id: string }>(idToMatch: string) => {
  return (itemToFind: T) => {
    return itemToFind.id === idToMatch;
  };
};
