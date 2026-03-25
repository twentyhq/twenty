import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaForeignKeyDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-foreign-key-definition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const ALLOWED_FK_ACTIONS = new Set([
  'CASCADE',
  'SET NULL',
  'RESTRICT',
  'NO ACTION',
  'SET DEFAULT',
]);

export class WorkspaceSchemaForeignKeyManagerService {
  async createForeignKey({
    queryRunner,
    schemaName,
    foreignKey,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    foreignKey: WorkspaceSchemaForeignKeyDefinition;
  }): Promise<void> {
    const foreignKeyName = queryRunner.connection.namingStrategy.foreignKeyName(
      foreignKey.tableName,
      [foreignKey.columnName],
      `${schemaName}.${foreignKey.referencedTableName}`,
      [foreignKey.referencedColumnName],
    );

    let sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(foreignKey.tableName)} ADD CONSTRAINT ${escapeIdentifier(foreignKeyName)} FOREIGN KEY (${escapeIdentifier(foreignKey.columnName)}) REFERENCES ${escapeIdentifier(schemaName)}.${escapeIdentifier(foreignKey.referencedTableName)} (${escapeIdentifier(foreignKey.referencedColumnName)})`;

    if (foreignKey.onDelete) {
      if (!ALLOWED_FK_ACTIONS.has(foreignKey.onDelete)) {
        throw new Error(`Unsupported ON DELETE action: ${foreignKey.onDelete}`);
      }
      sql += ` ON DELETE ${foreignKey.onDelete}`;
    }

    if (foreignKey.onUpdate) {
      if (!ALLOWED_FK_ACTIONS.has(foreignKey.onUpdate)) {
        throw new Error(`Unsupported ON UPDATE action: ${foreignKey.onUpdate}`);
      }
      sql += ` ON UPDATE ${foreignKey.onUpdate}`;
    }

    await queryRunner.query(sql);
  }

  async dropForeignKey({
    queryRunner,
    schemaName,
    tableName,
    foreignKeyName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    foreignKeyName: string;
  }): Promise<void> {
    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} DROP CONSTRAINT IF EXISTS ${escapeIdentifier(foreignKeyName)}`;

    await queryRunner.query(sql);
  }

  async setForeignKeyNotDeferrable({
    queryRunner,
    schemaName,
    tableName,
    foreignKeyName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    foreignKeyName: string;
  }): Promise<void> {
    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} ALTER CONSTRAINT ${escapeIdentifier(foreignKeyName)} NOT DEFERRABLE`;

    await queryRunner.query(sql);
  }

  async setForeignKeyDeferrable({
    queryRunner,
    schemaName,
    tableName,
    foreignKeyName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    foreignKeyName: string;
  }): Promise<void> {
    const sql = `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} ALTER CONSTRAINT ${escapeIdentifier(foreignKeyName)} DEFERRABLE`;

    await queryRunner.query(sql);
  }

  async getForeignKeyName({
    queryRunner,
    schemaName,
    tableName,
    columnName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnName: string;
  }): Promise<string | undefined> {
    // Uses parameterized query ($1, $2, $3) — safe against injection
    const foreignKeys = await queryRunner.query(
      `
      SELECT
        tc.constraint_name AS constraint_name
      FROM
        information_schema.table_constraints AS tc
      JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
        AND kcu.column_name = $3
    `,
      [schemaName, tableName, columnName],
    );

    return foreignKeys[0]?.constraint_name;
  }
}
