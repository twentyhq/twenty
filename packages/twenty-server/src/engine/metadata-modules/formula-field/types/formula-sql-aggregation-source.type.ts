// The table of the related records an aggregate reads, and their column pointing back to the record
export type FormulaSqlAggregationSource = {
  tableSql: string;
  joinColumnName: string;
};
