import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { validateAndReturnIndexWhereClause } from 'src/engine/workspace-manager/workspace-migration/utils/validate-index-where-clause.util';

const ALLOWED_INDEX_TYPES = new Set([
  'BTREE',
  'HASH',
  'GIST',
  'SPGIST',
  'GIN',
  'BRIN',
]);

export class WorkspaceSchemaIndexManagerService {
  async createIndex({
    queryRunner,
    schemaName,
    tableName,
    index,
    concurrently = false,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    index: WorkspaceSchemaIndexDefinition;
    concurrently?: boolean;
  }): Promise<void> {
    if (concurrently) {
      if (queryRunner.isTransactionActive) {
        throw new Error(
          'CREATE INDEX CONCURRENTLY cannot run inside a transaction block. Pass a QueryRunner with no active transaction.',
        );
      }

      await this.dropInvalidIndexIfExists({
        queryRunner,
        schemaName,
        indexName: index.name,
      });
    }

    const quotedColumns = index.columns.map((column) =>
      escapeIdentifier(column),
    );
    const isUnique = index.isUnique ? 'UNIQUE' : '';

    let indexType = '';

    if (index.type && index.type !== 'BTREE') {
      if (!ALLOWED_INDEX_TYPES.has(index.type)) {
        throw new Error(`Unsupported index type: ${index.type}`);
      }
      indexType = `USING ${index.type}`;
    }

    const validatedWhereClause = validateAndReturnIndexWhereClause(index.where);
    const whereClause = validatedWhereClause
      ? `WHERE ${validatedWhereClause}`
      : '';

    const sql = [
      'CREATE',
      isUnique && 'UNIQUE',
      'INDEX',
      concurrently && 'CONCURRENTLY',
      'IF NOT EXISTS',
      escapeIdentifier(index.name),
      'ON',
      `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`,
      indexType,
      `(${quotedColumns.join(', ')})`,
      whereClause,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    await queryRunner.query(sql);
  }

  private async dropInvalidIndexIfExists({
    queryRunner,
    schemaName,
    indexName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    indexName: string;
  }): Promise<void> {
    const invalidIndex = await queryRunner.query(
      `SELECT 1
         FROM pg_class c
         JOIN pg_namespace n ON c.relnamespace = n.oid
         JOIN pg_index i ON i.indexrelid = c.oid
         WHERE c.relname = $1 AND n.nspname = $2 AND NOT i.indisvalid
         LIMIT 1`,
      [indexName, schemaName],
    );

    if (invalidIndex.length === 0) {
      return;
    }

    await queryRunner.query(
      `DROP INDEX CONCURRENTLY IF EXISTS ${escapeIdentifier(schemaName)}.${escapeIdentifier(indexName)}`,
    );
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
    const sql = `DROP INDEX IF EXISTS ${escapeIdentifier(schemaName)}.${escapeIdentifier(indexName)}`;

    await queryRunner.query(sql);
  }
}
