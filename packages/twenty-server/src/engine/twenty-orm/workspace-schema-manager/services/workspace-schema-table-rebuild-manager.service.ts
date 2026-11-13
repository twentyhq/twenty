import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { type QueryRunner } from 'typeorm';

import { WORKSPACE_SCHEMA_TABLE_REBUILD_LOCK_TIMEOUT } from 'src/engine/twenty-orm/workspace-schema-manager/constants/workspace-schema-table-rebuild-lock-timeout.constant';
import { WORKSPACE_SCHEMA_TABLE_REBUILD_MAXIMUM_ROW_COUNT } from 'src/engine/twenty-orm/workspace-schema-manager/constants/workspace-schema-table-rebuild-maximum-row-count.constant';
import { WORKSPACE_SCHEMA_TABLE_REBUILD_TEMPORARY_TABLE_NAME_SUFFIX } from 'src/engine/twenty-orm/workspace-schema-manager/constants/workspace-schema-table-rebuild-temporary-table-name-suffix.constant';
import {
  WorkspaceSchemaManagerException,
  WorkspaceSchemaManagerExceptionCode,
} from 'src/engine/twenty-orm/workspace-schema-manager/exceptions/workspace-schema-manager.exception';
import { type WorkspaceSchemaTableColumnSlotUsage } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-table-column-slot-usage.type';
import { getEscapedQualifiedTableName } from 'src/engine/twenty-orm/workspace-schema-manager/utils/get-escaped-qualified-table-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type WorkspaceSchemaTableRebuildForeignKey = {
  escapedQualifiedTableName: string;
  constraintName: string;
  definition: string;
  isValidated: boolean;
};

type WorkspaceSchemaTableRebuildPlan = {
  copiedColumnNames: string[];
  keyConstraints: { constraintName: string; definition: string }[];
  outgoingForeignKeys: WorkspaceSchemaTableRebuildForeignKey[];
  incomingForeignKeys: WorkspaceSchemaTableRebuildForeignKey[];
  indexDefinitions: string[];
};

export class WorkspaceSchemaTableRebuildManagerService {
  findColumnSlotUsages({
    queryRunner,
    schemaName,
    tableNames,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableNames: string[];
  }): Promise<WorkspaceSchemaTableColumnSlotUsage[]> {
    return queryRunner.query(
      `SELECT c.relname AS "tableName",
              COALESCE(MAX(a.attnum), 0)::int AS "usedColumnSlotCount",
              (COUNT(*) FILTER (WHERE a.attisdropped))::int AS "droppedColumnCount",
              c.reltuples::float8 AS "estimatedRowCount"
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         LEFT JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0
        WHERE n.nspname = $1
          AND c.relname = ANY($2)
          AND c.relkind = 'r'
        GROUP BY c.relname, c.reltuples
        ORDER BY c.relname`,
      [schemaName, tableNames],
    );
  }

  async rebuildTable({
    queryRunner,
    schemaName,
    tableName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
  }): Promise<void> {
    const escapedQualifiedTableName = getEscapedQualifiedTableName({
      schemaName,
      tableName,
    });

    await this.assertTableCanBeRebuiltOrThrow({
      queryRunner,
      escapedQualifiedTableName,
    });

    const workspaceSchemaTableRebuildPlan = await this.swapTableInTransaction({
      queryRunner,
      schemaName,
      tableName,
    });

    for (const {
      escapedQualifiedTableName: escapedQualifiedForeignKeyTableName,
      constraintName,
      isValidated,
    } of [
      ...workspaceSchemaTableRebuildPlan.outgoingForeignKeys,
      ...workspaceSchemaTableRebuildPlan.incomingForeignKeys,
    ]) {
      if (!isValidated) {
        continue;
      }

      await queryRunner.query(
        `ALTER TABLE ${escapedQualifiedForeignKeyTableName} VALIDATE CONSTRAINT ${escapeIdentifier(constraintName)}`,
      );
    }

    await queryRunner.query(`ANALYZE ${escapedQualifiedTableName}`);
  }

  private async swapTableInTransaction({
    queryRunner,
    schemaName,
    tableName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
  }): Promise<WorkspaceSchemaTableRebuildPlan> {
    const escapedQualifiedTableName = getEscapedQualifiedTableName({
      schemaName,
      tableName,
    });

    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `SET LOCAL lock_timeout = '${WORKSPACE_SCHEMA_TABLE_REBUILD_LOCK_TIMEOUT}'`,
      );
      await queryRunner.query(
        `LOCK TABLE ${escapedQualifiedTableName} IN ACCESS EXCLUSIVE MODE`,
      );

      const workspaceSchemaTableRebuildPlan = await this.readRebuildPlan({
        queryRunner,
        escapedQualifiedTableName,
      });

      await this.applyRebuildPlan({
        queryRunner,
        schemaName,
        tableName,
        workspaceSchemaTableRebuildPlan,
      });

      await queryRunner.commitTransaction();

      return workspaceSchemaTableRebuildPlan;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    }
  }

  private async assertTableCanBeRebuiltOrThrow({
    queryRunner,
    escapedQualifiedTableName,
  }: {
    queryRunner: QueryRunner;
    escapedQualifiedTableName: string;
  }): Promise<void> {
    const [{ hasUnsupportedFeature }]: { hasUnsupportedFeature: boolean }[] =
      await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM pg_trigger
                         WHERE tgrelid = $1::regclass AND NOT tgisinternal)
             OR EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = $1::regclass)
             OR EXISTS (SELECT 1 FROM pg_inherits
                         WHERE inhrelid = $1::regclass OR inhparent = $1::regclass)
             OR EXISTS (SELECT 1 FROM pg_attribute
                         WHERE attrelid = $1::regclass
                           AND attnum > 0
                           AND NOT attisdropped
                           AND pg_get_serial_sequence($2::text, attname::text) IS NOT NULL)
                AS "hasUnsupportedFeature"`,
        [escapedQualifiedTableName, escapedQualifiedTableName],
      );

    if (hasUnsupportedFeature) {
      throw new WorkspaceSchemaManagerException(
        `Table ${escapedQualifiedTableName} cannot be rebuilt: it has triggers, row level security policies, inheritance, or identity or serial columns, which a rebuild would not carry over`,
        WorkspaceSchemaManagerExceptionCode.TABLE_REBUILD_NOT_SUPPORTED,
      );
    }

    await queryRunner.query(`ANALYZE ${escapedQualifiedTableName}`);

    const [{ estimatedRowCount }]: { estimatedRowCount: number }[] =
      await queryRunner.query(
        `SELECT reltuples::float8 AS "estimatedRowCount"
           FROM pg_class WHERE oid = $1::regclass`,
        [escapedQualifiedTableName],
      );

    if (estimatedRowCount > WORKSPACE_SCHEMA_TABLE_REBUILD_MAXIMUM_ROW_COUNT) {
      throw new WorkspaceSchemaManagerException(
        `Table ${escapedQualifiedTableName} cannot be rebuilt: it holds about ${estimatedRowCount} rows, above the ${WORKSPACE_SCHEMA_TABLE_REBUILD_MAXIMUM_ROW_COUNT} rows a rebuild can copy while the table is locked`,
        WorkspaceSchemaManagerExceptionCode.TABLE_REBUILD_NOT_SUPPORTED,
      );
    }
  }

  private async readRebuildPlan({
    queryRunner,
    escapedQualifiedTableName,
  }: {
    queryRunner: QueryRunner;
    escapedQualifiedTableName: string;
  }): Promise<WorkspaceSchemaTableRebuildPlan> {
    const copiedColumns: { columnName: string }[] = await queryRunner.query(
      `SELECT attname AS "columnName"
         FROM pg_attribute
        WHERE attrelid = $1::regclass
          AND attnum > 0
          AND NOT attisdropped
          AND attgenerated = ''
        ORDER BY attnum`,
      [escapedQualifiedTableName],
    );

    const keyConstraints: WorkspaceSchemaTableRebuildPlan['keyConstraints'] =
      await queryRunner.query(
        `SELECT conname AS "constraintName",
                pg_get_constraintdef(oid) AS "definition"
           FROM pg_constraint
          WHERE conrelid = $1::regclass
            AND contype IN ('p', 'u', 'x')
          ORDER BY conname`,
        [escapedQualifiedTableName],
      );

    const foreignKeys: (WorkspaceSchemaTableRebuildForeignKey & {
      isIncoming: boolean;
    })[] = await queryRunner.query(
      `SELECT quote_ident(n.nspname) || '.' || quote_ident(c.relname) AS "escapedQualifiedTableName",
              con.conname AS "constraintName",
              pg_get_constraintdef(con.oid) AS "definition",
              con.convalidated AS "isValidated",
              con.conrelid <> $1::regclass AS "isIncoming"
         FROM pg_constraint con
         JOIN pg_class c ON c.oid = con.conrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE con.contype = 'f'
          AND (con.conrelid = $1::regclass OR con.confrelid = $1::regclass)
        ORDER BY c.relname, con.conname`,
      [escapedQualifiedTableName],
    );

    const indexes: { definition: string }[] = await queryRunner.query(
      `SELECT pg_get_indexdef(i.indexrelid) AS "definition"
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
        WHERE i.indrelid = $1::regclass
          AND NOT EXISTS (
            SELECT 1 FROM pg_constraint con
             WHERE con.conindid = i.indexrelid
               AND con.conrelid = i.indrelid
               AND con.contype IN ('p', 'u', 'x')
          )
        ORDER BY c.relname`,
      [escapedQualifiedTableName],
    );

    return {
      copiedColumnNames: copiedColumns.map(({ columnName }) => columnName),
      keyConstraints,
      outgoingForeignKeys: foreignKeys.filter(({ isIncoming }) => !isIncoming),
      incomingForeignKeys: foreignKeys.filter(({ isIncoming }) => isIncoming),
      indexDefinitions: indexes.map(({ definition }) => definition),
    };
  }

  private async applyRebuildPlan({
    queryRunner,
    schemaName,
    tableName,
    workspaceSchemaTableRebuildPlan: {
      copiedColumnNames,
      keyConstraints,
      outgoingForeignKeys,
      incomingForeignKeys,
      indexDefinitions,
    },
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    workspaceSchemaTableRebuildPlan: WorkspaceSchemaTableRebuildPlan;
  }): Promise<void> {
    const temporaryTableName = `${tableName.slice(
      0,
      IDENTIFIER_MAX_CHAR_LENGTH -
        WORKSPACE_SCHEMA_TABLE_REBUILD_TEMPORARY_TABLE_NAME_SUFFIX.length,
    )}${WORKSPACE_SCHEMA_TABLE_REBUILD_TEMPORARY_TABLE_NAME_SUFFIX}`;
    const escapedQualifiedTableName = getEscapedQualifiedTableName({
      schemaName,
      tableName,
    });
    const escapedQualifiedTemporaryTableName = getEscapedQualifiedTableName({
      schemaName,
      tableName: temporaryTableName,
    });
    const escapedColumnNames = copiedColumnNames
      .map(escapeIdentifier)
      .join(', ');

    await queryRunner.query(
      `CREATE TABLE ${escapedQualifiedTemporaryTableName} (
         LIKE ${escapedQualifiedTableName}
         INCLUDING DEFAULTS INCLUDING GENERATED
         INCLUDING CONSTRAINTS INCLUDING STORAGE INCLUDING COMMENTS
       )`,
    );

    await queryRunner.query(
      `INSERT INTO ${escapedQualifiedTemporaryTableName} (${escapedColumnNames})
       SELECT ${escapedColumnNames} FROM ${escapedQualifiedTableName}`,
    );

    for (const {
      escapedQualifiedTableName: escapedQualifiedReferencingTableName,
      constraintName,
    } of incomingForeignKeys) {
      await queryRunner.query(
        `ALTER TABLE ${escapedQualifiedReferencingTableName} DROP CONSTRAINT ${escapeIdentifier(constraintName)}`,
      );
    }

    await queryRunner.query(`DROP TABLE ${escapedQualifiedTableName}`);

    await queryRunner.query(
      `ALTER TABLE ${escapedQualifiedTemporaryTableName} RENAME TO ${escapeIdentifier(tableName)}`,
    );

    for (const { constraintName, definition } of keyConstraints) {
      await queryRunner.query(
        `ALTER TABLE ${escapedQualifiedTableName} ADD CONSTRAINT ${escapeIdentifier(constraintName)} ${definition}`,
      );
    }

    for (const indexDefinition of indexDefinitions) {
      await queryRunner.query(indexDefinition);
    }

    for (const {
      escapedQualifiedTableName: escapedQualifiedForeignKeyTableName,
      constraintName,
      definition,
      isValidated,
    } of [...outgoingForeignKeys, ...incomingForeignKeys]) {
      await queryRunner.query(
        `ALTER TABLE ${escapedQualifiedForeignKeyTableName} ADD CONSTRAINT ${escapeIdentifier(constraintName)} ${definition}${isValidated ? ' NOT VALID' : ''}`,
      );
    }
  }
}
