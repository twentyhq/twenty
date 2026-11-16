// `readComputedColumnNames`: the computed columns of the same table alias that the SQL reads
export type ComputedColumnSql = {
  sql: string;
  readComputedColumnNames: string[];
};
