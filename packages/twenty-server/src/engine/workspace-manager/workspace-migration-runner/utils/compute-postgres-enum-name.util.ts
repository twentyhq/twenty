type ComputePostgresEnumNameParams = {
  tableName: string;
  columnName: string;
};

export const computePostgresEnumName = ({
  tableName,
  columnName,
}: ComputePostgresEnumNameParams): string => {
  return `${tableName}_${columnName}_enum`;
};
