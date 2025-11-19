import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { buildSqlColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

export class WorkspaceSchemaTableManagerService {
  async createTable({
    queryRunner,
    schemaName,
    tableName,
    columnDefinitions,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnDefinitions?: WorkspaceSchemaColumnDefinition[];
  }): Promise<void> {
    const sqlColumnDefinitions =
      columnDefinitions?.map((columnDefinition) =>
        buildSqlColumnDefinition(columnDefinition),
      ) || [];

    // Add default columns if no columns specified
    if (sqlColumnDefinitions.length === 0) {
      sqlColumnDefinitions.push(
        '"id" uuid PRIMARY KEY DEFAULT gen_random_uuid()',
      );
    }

    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const sql = `CREATE TABLE IF NOT EXISTS "${safeSchemaName}"."${safeTableName}" (${sqlColumnDefinitions.join(', ')})`;

    await queryRunner.query(sql);
  }

  async dropTable({
    queryRunner,
    schemaName,
    tableName,
    cascade = false,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    cascade?: boolean;
  }): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const cascadeClause = cascade ? ' CASCADE' : '';
    const sql = `DROP TABLE IF EXISTS "${safeSchemaName}"."${safeTableName}"${cascadeClause}`;

    await queryRunner.query(sql);
  }

  async renameTable({
    queryRunner,
    schemaName,
    oldTableName,
    newTableName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    oldTableName: string;
    newTableName: string;
  }): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeOldTableName = removeSqlDDLInjection(oldTableName);
    const safeNewTableName = removeSqlDDLInjection(newTableName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeOldTableName}" RENAME TO "${safeNewTableName}"`;

    await queryRunner.query(sql);
  }
}
