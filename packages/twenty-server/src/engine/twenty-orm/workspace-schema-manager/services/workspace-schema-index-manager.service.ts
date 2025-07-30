import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import { WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

@Injectable()
export class WorkspaceSchemaIndexManagerService {
  async createIndex(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    index: WorkspaceSchemaIndexDefinition,
  ): Promise<void> {
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
      const whereClause = index.where ? `WHERE ${index.where}` : '';
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

  async dropIndex(
    queryRunner: QueryRunner,
    schemaName: string,
    indexName: string,
  ): Promise<void> {
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

  async renameIndex(
    queryRunner: QueryRunner,
    schemaName: string,
    oldIndexName: string,
    newIndexName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeOldIndexName = removeSqlDDLInjection(oldIndexName);
    const safeNewIndexName = removeSqlDDLInjection(newIndexName);
    const sql = `ALTER INDEX "${safeSchemaName}"."${safeOldIndexName}" RENAME TO "${safeNewIndexName}"`;

    await queryRunner.query(sql);
  }

  async indexExists(
    queryRunner: QueryRunner,
    schemaName: string,
    indexName: string,
  ): Promise<boolean> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeIndexName = removeSqlDDLInjection(indexName);

    const result = await queryRunner.query(
      `SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = $1 AND indexname = $2
      )`,
      [safeSchemaName, safeIndexName],
    );

    return result[0]?.exists || false;
  }

  async getIndexesForTable(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
  ): Promise<Array<{ indexname: string; indexdef: string }>> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);

    const result = await queryRunner.query(
      `SELECT indexname, indexdef 
       FROM pg_indexes 
       WHERE schemaname = $1 AND tablename = $2`,
      [safeSchemaName, safeTableName],
    );

    return result;
  }

  async createPrimaryKey(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    constraintName: string,
    columnNames: string[],
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeConstraintName = removeSqlDDLInjection(constraintName);
    const quotedColumns = columnNames
      .map((col) => `"${removeSqlDDLInjection(col)}"`)
      .join(', ');
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ADD CONSTRAINT "${safeConstraintName}" PRIMARY KEY (${quotedColumns})`;

    await queryRunner.query(sql);
  }

  async dropPrimaryKey(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    constraintName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeConstraintName = removeSqlDDLInjection(constraintName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" DROP CONSTRAINT IF EXISTS "${safeConstraintName}"`;

    await queryRunner.query(sql);
  }

  async createUniqueConstraint(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    constraintName: string,
    columnNames: string[],
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeConstraintName = removeSqlDDLInjection(constraintName);
    const quotedColumns = columnNames
      .map((col) => `"${removeSqlDDLInjection(col)}"`)
      .join(', ');
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ADD CONSTRAINT "${safeConstraintName}" UNIQUE (${quotedColumns})`;

    await queryRunner.query(sql);
  }

  async dropUniqueConstraint(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    constraintName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeConstraintName = removeSqlDDLInjection(constraintName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" DROP CONSTRAINT IF EXISTS "${safeConstraintName}"`;

    await queryRunner.query(sql);
  }
}
