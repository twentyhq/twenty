import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

export class WorkspaceSchemaIndexManagerService {
  async createIndex({
    queryRunner,
    schemaName,
    tableName,
    index,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    index: WorkspaceSchemaIndexDefinition;
  }): Promise<void> {
    try {
      const safeSchemaName = removeSqlDDLInjection(schemaName);
      const safeTableName = removeSqlDDLInjection(tableName);
      const safeIndexName = removeSqlDDLInjection(index.name);

      const quotedColumns = index.columns.map(
        (column) => `"${removeSqlDDLInjection(column)}"`,
      );
      const isUnique = index.isUnique ? 'UNIQUE' : '';
      const indexType =
        index.type && index.type !== 'BTREE' ? `USING ${index.type}` : '';
      const whereClause = index.where ? `WHERE ${index.where}` : ''; // TODO: to sanitize
      const includeClause = index.include?.length
        ? `INCLUDE (${index.include
            .map((col) => `"${removeSqlDDLInjection(col)}"`)
            .join(', ')})`
        : '';

      const sql = [
        'CREATE',
        isUnique && 'UNIQUE',
        'INDEX IF NOT EXISTS',
        `"${safeIndexName}"`,
        'ON',
        `"${safeSchemaName}"."${safeTableName}"`,
        indexType,
        `(${quotedColumns.join(', ')})`,
        includeClause,
        whereClause,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      await queryRunner.query(sql);
    } catch (error: unknown) {
      // Ignore error if index already exists
      if (error instanceof Error && 'code' in error && error.code === '42P07') {
        return;
      }
      throw error;
    }
  }

  async dropIndex({
    queryRunner,
    schemaName,
    indexName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    indexName: string;
  }): Promise<void> {
    try {
      const safeSchemaName = removeSqlDDLInjection(schemaName);
      const safeIndexName = removeSqlDDLInjection(indexName);
      const sql = `DROP INDEX IF EXISTS "${safeSchemaName}"."${safeIndexName}"`;

      await queryRunner.query(sql);
    } catch (error: unknown) {
      // Ignore error if index does not exist
      if (error instanceof Error && 'code' in error && error.code === '42704') {
        return;
      }
      throw error;
    }
  }

  async renameIndex({
    queryRunner,
    schemaName,
    oldIndexName,
    newIndexName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    oldIndexName: string;
    newIndexName: string;
  }): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeOldIndexName = removeSqlDDLInjection(oldIndexName);
    const safeNewIndexName = removeSqlDDLInjection(newIndexName);
    const sql = `ALTER INDEX "${safeSchemaName}"."${safeOldIndexName}" RENAME TO "${safeNewIndexName}"`;

    await queryRunner.query(sql);
  }

  async createUniqueConstraint({
    queryRunner,
    schemaName,
    tableName,
    constraintName,
    columnNames,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    constraintName: string;
    columnNames: string[];
  }): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeConstraintName = removeSqlDDLInjection(constraintName);
    const quotedColumns = columnNames
      .map((col) => `"${removeSqlDDLInjection(col)}"`)
      .join(', ');
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ADD CONSTRAINT "${safeConstraintName}" UNIQUE (${quotedColumns})`;

    await queryRunner.query(sql);
  }

  async dropUniqueConstraint({
    queryRunner,
    schemaName,
    tableName,
    constraintName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    constraintName: string;
  }): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeConstraintName = removeSqlDDLInjection(constraintName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" DROP CONSTRAINT IF EXISTS "${safeConstraintName}"`;

    await queryRunner.query(sql);
  }
}
