export const formatNumberOfStars = (numberOfStars: number) => {
  return Math.floor(numberOfStars / 100) / 10 + 'k';
};
