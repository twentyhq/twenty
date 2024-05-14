export const formatNumberOfStars = (numberOfStars: number) => {
  return Math.round(numberOfStars / 100) / 10 + 'k';
};
