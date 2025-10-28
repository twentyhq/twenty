import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaForeignKeyDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-foreign-key-definition.type';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

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

    let sql = `ALTER TABLE "${schemaName}"."${foreignKey.tableName}" ADD CONSTRAINT "${foreignKeyName}" FOREIGN KEY ("${foreignKey.columnName}") REFERENCES "${schemaName}"."${foreignKey.referencedTableName}" ("${foreignKey.referencedColumnName}")`;

    if (foreignKey.onDelete) {
      sql += ` ON DELETE ${foreignKey.onDelete}`;
    }

    if (foreignKey.onUpdate) {
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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeForeignKeyName = removeSqlDDLInjection(foreignKeyName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" DROP CONSTRAINT IF EXISTS "${safeForeignKeyName}"`;

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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeForeignKeyName = removeSqlDDLInjection(foreignKeyName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER CONSTRAINT "${safeForeignKeyName}" NOT DEFERRABLE`;

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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeForeignKeyName = removeSqlDDLInjection(foreignKeyName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER CONSTRAINT "${safeForeignKeyName}" DEFERRABLE`;

    await queryRunner.query(sql);
  }
}
