// Prefixed so it never meets the record alias or a lookup alias
export const getFormulaSqlAggregateAlias = (
  relationFieldName: string,
): string => `aggregate_${relationFieldName}`;
