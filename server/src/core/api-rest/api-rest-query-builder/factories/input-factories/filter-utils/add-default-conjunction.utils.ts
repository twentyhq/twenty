export const addDefaultConjunctionIfMissing = (filterQuery: string): string => {
  if (!(filterQuery.includes('(') && filterQuery.includes(')'))) {
    return `and(${filterQuery})`;
  }

  return filterQuery;
};
