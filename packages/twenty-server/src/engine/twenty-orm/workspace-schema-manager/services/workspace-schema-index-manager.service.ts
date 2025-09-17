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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeIndexName = removeSqlDDLInjection(index.name);

    const quotedColumns = index.columns.map(
      (column) => `"${removeSqlDDLInjection(column)}"`,
    );
    const isUnique = index.isUnique ? 'UNIQUE' : '';
    const indexType =
      index.type && index.type !== 'BTREE' ? `USING ${index.type}` : '';
    const whereClause = index.where ? `WHERE ${index.where}` : ''; // TODO: to sanitize -> might search for a lib to sanitize sql queries

    const sql = [
      'CREATE',
      isUnique && 'UNIQUE',
      'INDEX IF NOT EXISTS',
      `"${safeIndexName}"`,
      'ON',
      `"${safeSchemaName}"."${safeTableName}"`,
      indexType,
      `(${quotedColumns.join(', ')})`,
      whereClause,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    await queryRunner.query(sql);
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
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeIndexName = removeSqlDDLInjection(indexName);
    const sql = `DROP INDEX IF EXISTS "${safeSchemaName}"."${safeIndexName}"`;

    await queryRunner.query(sql);
  }
}
