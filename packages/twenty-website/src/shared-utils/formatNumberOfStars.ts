export const formatNumberOfStars = (numberOfStars: number) => {
  return Math.ceil(numberOfStars / 100) / 10 + 'k';
};
