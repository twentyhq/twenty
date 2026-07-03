import { type QueryRunner } from 'typeorm';

import {
  WorkspaceSchemaManagerException,
  WorkspaceSchemaManagerExceptionCode,
} from 'src/engine/twenty-orm/workspace-schema-manager/exceptions/workspace-schema-manager.exception';
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
    if (concurrently && queryRunner.isTransactionActive) {
      throw new WorkspaceSchemaManagerException(
        'CREATE INDEX CONCURRENTLY cannot run inside a transaction block. Pass a QueryRunner with no active transaction.',
        WorkspaceSchemaManagerExceptionCode.CONCURRENT_INDEX_CREATION_IN_TRANSACTION,
      );
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

  async renameIndexWithoutRebuild({
    queryRunner,
    schemaName,
    fromIndexName,
    toIndexName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    fromIndexName: string;
    toIndexName: string;
  }): Promise<void> {
    const sql = `ALTER INDEX ${escapeIdentifier(schemaName)}.${escapeIdentifier(fromIndexName)} RENAME TO ${escapeIdentifier(toIndexName)}`;

    await queryRunner.query(sql);
  }
}
