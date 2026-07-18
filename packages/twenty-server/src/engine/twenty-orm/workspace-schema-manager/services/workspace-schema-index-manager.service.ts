import { msg } from '@lingui/core/macro';
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

const DUPLICATE_INDEX_VALUES_LIMIT = 5;

const formatDuplicateIndexValue = (value: unknown): string => {
  const serializedValue =
    typeof value === 'string' || typeof value === 'bigint'
      ? String(value)
      : JSON.stringify(value);

  return (serializedValue ?? String(value)).slice(0, 100);
};

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

    if (index.isUnique) {
      const nonNullCondition = quotedColumns
        .map((column) => `${column} IS NOT NULL`)
        .join(' AND ');
      const duplicateWhereClause = whereClause
        ? `${whereClause} AND ${nonNullCondition}`
        : `WHERE ${nonNullCondition}`;
      const duplicateRows = (await queryRunner.query(
        [
          'SELECT',
          quotedColumns.join(', '),
          'FROM',
          `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`,
          duplicateWhereClause,
          'GROUP BY',
          quotedColumns.join(', '),
          'HAVING COUNT(*) > 1',
          `LIMIT ${DUPLICATE_INDEX_VALUES_LIMIT}`,
        ].join(' '),
      )) as Record<string, unknown>[];

      if (duplicateRows.length > 0) {
        const duplicateValues = duplicateRows
          .map((row) =>
            quotedColumns
              .map((column) => {
                const columnName = column.slice(1, -1).replaceAll('""', '"');

                return `${columnName}=${formatDuplicateIndexValue(row[columnName])}`;
              })
              .join(', '),
          )
          .join('; ');

        throw new WorkspaceSchemaManagerException(
          `Cannot create unique index "${index.name}" because duplicate values already exist: ${duplicateValues}`,
          WorkspaceSchemaManagerExceptionCode.DUPLICATE_INDEX_VALUES,
          {
            userFriendlyMessage: msg`Cannot enable uniqueness because duplicate values already exist (${duplicateValues}). Remove or update the duplicate records and try again.`,
          },
        );
      }
    }

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
}
