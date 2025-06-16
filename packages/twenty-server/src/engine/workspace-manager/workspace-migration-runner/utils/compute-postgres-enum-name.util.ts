import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

type ComputePostgresEnumNameParams = {
  tableName: string;
  columnName: string;
};

export const computePostgresEnumName = ({
  tableName,
  columnName,
}: ComputePostgresEnumNameParams): string => {
  return removeSqlDDLInjection(`${tableName}_${columnName}_enum`);
};
