import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { buildSqlColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

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

    if (sqlColumnDefinitions.length === 0) {
      sqlColumnDefinitions.push(
        '"id" uuid PRIMARY KEY DEFAULT gen_random_uuid()',
      );
    }

    const sql = `CREATE TABLE IF NOT EXISTS ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} (${sqlColumnDefinitions.join(', ')})`;

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
    const cascadeClause = cascade ? ' CASCADE' : '';
    const sql = `DROP TABLE IF EXISTS ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}${cascadeClause}`;

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
    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(oldTableName)} RENAME TO ${escapeIdentifier(newTableName)}`;

    await queryRunner.query(sql);
  }
}
