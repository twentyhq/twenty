import { type ColumnType, type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { buildSqlColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export class WorkspaceSchemaColumnManagerService {
  async addColumns({
    queryRunner,
    schemaName,
    tableName,
    columnDefinitions,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnDefinitions: WorkspaceSchemaColumnDefinition[];
  }): Promise<void> {
    if (columnDefinitions.length === 0) return;

    const addColumnClauses = columnDefinitions.map(
      (column) => `ADD COLUMN ${buildSqlColumnDefinition(column)}`,
    );
    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} ${addColumnClauses.join(', ')}`;

    await queryRunner.query(sql);
  }

  async dropColumns({
    queryRunner,
    schemaName,
    tableName,
    columnNames,
    cascade = false,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnNames: string[];
    cascade?: boolean;
  }): Promise<void> {
    if (columnNames.length === 0) return;

    const cascadeClause = cascade ? ' CASCADE' : '';
    const dropClauses = columnNames.map(
      (name) =>
        `DROP COLUMN IF EXISTS ${escapeIdentifier(name)}${cascadeClause}`,
    );
    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} ${dropClauses.join(', ')}`;

    await queryRunner.query(sql);
  }

  async renameColumn({
    queryRunner,
    schemaName,
    tableName,
    oldColumnName,
    newColumnName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    oldColumnName: string;
    newColumnName: string;
  }): Promise<void> {
    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} RENAME COLUMN ${escapeIdentifier(oldColumnName)} TO ${escapeIdentifier(newColumnName)}`;

    await queryRunner.query(sql);
  }

  async alterColumnDefault({
    queryRunner,
    schemaName,
    tableName,
    columnName,
    defaultValue,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnName: string;
    defaultValue?: string | number | boolean | null;
    columnType?: ColumnType;
  }): Promise<void> {
    const tableRef = `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`;
    const columnRef = escapeIdentifier(columnName);

    const computeDefaultValueSqlQuery = () => {
      if (defaultValue === undefined) {
        return `ALTER TABLE ${tableRef} ALTER COLUMN ${columnRef} DROP DEFAULT`;
      }

      if (defaultValue === null) {
        return `ALTER TABLE ${tableRef} ALTER COLUMN ${columnRef} SET DEFAULT NULL`;
      }

      // defaultValue here is pre-serialized by serializeDefaultValue which
      // already applies escaping/sanitization to the value.
      return `ALTER TABLE ${tableRef} ALTER COLUMN ${columnRef} SET DEFAULT ${defaultValue}`;
    };

    const sql = computeDefaultValueSqlQuery();

    await queryRunner.query(sql);
  }
}
