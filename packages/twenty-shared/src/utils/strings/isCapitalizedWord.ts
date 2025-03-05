export const isCapitalizedWord = (word: string) => {
  const firstChar = word[0];
  return (
    firstChar.toLowerCase() !== firstChar &&
    firstChar.toUpperCase() == firstChar
  );
};
