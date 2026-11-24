export const getSearchMatchScore = ({
  value,
  query,
}: {
  value: string;
  query: string;
}) => {
  if (value === query) {
    return 100;
  }

  if (value.startsWith(query)) {
    return 75;
  }

  if (value.includes(query)) {
    return 50;
  }

  return 0;
};
