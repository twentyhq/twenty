// This code is from TypeORM and is used to build the SQL for creating a column

import { type Table, type TableColumn } from 'typeorm';

import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util';

// Do not modify: https://github.com/typeorm/typeorm/blob/master/src/driver/postgres/PostgresQueryRunner.ts#L4713
export const typeormBuildCreateColumnSql = ({
  table,
  column,
}: {
  table: Pick<Table, 'name'>;
  column: Pick<
    TableColumn,
    | 'name'
    | 'type'
    | 'isArray'
    | 'isNullable'
    | 'default'
    | 'generatedType'
    | 'asExpression'
    | 'precision'
  >;
}): string => {
  let columnSql = '"' + column.name + '"';

  if (column.type === 'enum' || column.type === 'simple-enum') {
    columnSql += ` "${computePostgresEnumName({
      tableName: table.name,
      columnName: column.name,
    })}"`;
  } else {
    columnSql += ' ' + column.type;
    if (column.precision) columnSql += `(${column.precision})`;
  }

  if (column.isArray) columnSql += '[]';

  if (column.generatedType === 'STORED' && column.asExpression) {
    columnSql += ` GENERATED ALWAYS AS (${column.asExpression}) STORED`;
  }

  if (column.isNullable !== true) columnSql += ' NOT NULL';
  if (column.default !== undefined && column.default !== null)
    columnSql += ' DEFAULT ' + column.default;

  return columnSql;
};
