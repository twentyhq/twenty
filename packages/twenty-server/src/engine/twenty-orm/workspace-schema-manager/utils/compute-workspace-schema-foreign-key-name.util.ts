import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaForeignKeyDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-foreign-key-definition.type';

export const computeWorkspaceSchemaForeignKeyName = ({
  queryRunner,
  schemaName,
  foreignKey,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
  foreignKey: Pick<
    WorkspaceSchemaForeignKeyDefinition,
    'tableName' | 'columnName' | 'referencedTableName' | 'referencedColumnName'
  >;
}): string =>
  queryRunner.connection.namingStrategy.foreignKeyName(
    foreignKey.tableName,
    [foreignKey.columnName],
    `${schemaName}.${foreignKey.referencedTableName}`,
    [foreignKey.referencedColumnName],
  );
