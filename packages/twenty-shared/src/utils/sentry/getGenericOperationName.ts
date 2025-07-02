// truncates to first word: FindOnePerson -> Find, AggregateCompanies -> Aggregate, ...
export const getGenericOperationName = (name?: string) => {
  return name?.match(/^[A-Z][a-z]*/)?.[0];
};
