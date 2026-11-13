import { Injectable } from '@nestjs/common';

import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { WORKSPACE_TABLE_REBUILD_LOCK_TIMEOUT } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/workspace-table-rebuild-lock-timeout.constant';
import { WORKSPACE_TABLE_REBUILD_TEMPORARY_TABLE_NAME_SUFFIX } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/workspace-table-rebuild-temporary-table-name-suffix.constant';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import { type WorkspaceTableColumnSlotUsage } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-table-column-slot-usage.type';
import {
  type WorkspaceTableRebuildPlan,
  type WorkspaceTableRebuildPlanConstraint,
  type WorkspaceTableRebuildPlanIdentitySequence,
  type WorkspaceTableRebuildPlanIncomingForeignKey,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-table-rebuild-plan.type';
import { getEscapedQualifiedTableName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-escaped-qualified-table-name.util';

type WorkspaceTableArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  tableName: string;
};

type ColumnRow = {
  columnName: string;
  isGenerated: boolean;
  isIdentity: boolean;
  sequenceName: string | null;
};

type UnsupportedFeatureRow = {
  triggerCount: number;
  policyCount: number;
  inheritanceCount: number;
};

@Injectable()
export class WorkspaceTableRebuildService {
  findColumnSlotUsages({
    queryRunner,
    schemaName,
  }: Pick<WorkspaceTableArgs, 'queryRunner' | 'schemaName'>): Promise<
    WorkspaceTableColumnSlotUsage[]
  > {
    return queryRunner.query(
      `SELECT c.relname AS "tableName",
              COALESCE(MAX(a.attnum), 0)::int AS "usedColumnSlotCount",
              (COUNT(*) FILTER (WHERE a.attisdropped))::int AS "droppedColumnCount"
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         LEFT JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0
        WHERE n.nspname = $1
          AND c.relkind = 'r'
        GROUP BY c.relname
        ORDER BY c.relname`,
      [schemaName],
    );
  }

  async rebuildTable({
    queryRunner,
    schemaName,
    tableName,
  }: WorkspaceTableArgs): Promise<void> {
    const escapedQualifiedTableName = getEscapedQualifiedTableName({
      schemaName,
      tableName,
    });

    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `SET LOCAL lock_timeout = '${WORKSPACE_TABLE_REBUILD_LOCK_TIMEOUT}'`,
      );
      await queryRunner.query(
        `LOCK TABLE ${escapedQualifiedTableName} IN ACCESS EXCLUSIVE MODE`,
      );

      const workspaceTableRebuildPlan = await this.readRebuildPlanOrThrow({
        queryRunner,
        schemaName,
        tableName,
      });

      await this.applyRebuildPlan({
        queryRunner,
        schemaName,
        tableName,
        workspaceTableRebuildPlan,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    }

    await queryRunner.query(`ANALYZE ${escapedQualifiedTableName}`);
  }

  private async readRebuildPlanOrThrow({
    queryRunner,
    schemaName,
    tableName,
  }: WorkspaceTableArgs): Promise<WorkspaceTableRebuildPlan> {
    const escapedQualifiedTableName = getEscapedQualifiedTableName({
      schemaName,
      tableName,
    });

    const [unsupportedFeatures]: UnsupportedFeatureRow[] =
      await queryRunner.query(
        `SELECT (SELECT COUNT(*) FROM pg_trigger
                  WHERE tgrelid = $1::regclass AND NOT tgisinternal)::int AS "triggerCount",
                (SELECT COUNT(*) FROM pg_policy
                  WHERE polrelid = $1::regclass)::int AS "policyCount",
                (SELECT COUNT(*) FROM pg_inherits
                  WHERE inhrelid = $1::regclass OR inhparent = $1::regclass)::int AS "inheritanceCount"`,
        [escapedQualifiedTableName],
      );

    const columns: ColumnRow[] = await queryRunner.query(
      `SELECT a.attname AS "columnName",
              a.attgenerated <> '' AS "isGenerated",
              a.attidentity <> '' AS "isIdentity",
              pg_get_serial_sequence($2::text, a.attname::text) AS "sequenceName"
         FROM pg_attribute a
        WHERE a.attrelid = $1::regclass
          AND a.attnum > 0
          AND NOT a.attisdropped
        ORDER BY a.attnum`,
      [escapedQualifiedTableName, escapedQualifiedTableName],
    );

    const hasSerialColumn = columns.some(
      ({ sequenceName, isIdentity }) => isDefined(sequenceName) && !isIdentity,
    );

    if (
      unsupportedFeatures.triggerCount > 0 ||
      unsupportedFeatures.policyCount > 0 ||
      unsupportedFeatures.inheritanceCount > 0 ||
      hasSerialColumn
    ) {
      throw new WorkspaceMigrationRunnerException({
        message: `Table ${escapedQualifiedTableName} cannot be rebuilt: it has triggers, row level security policies, inheritance or serial columns, which a rebuild would not carry over`,
        code: WorkspaceMigrationRunnerExceptionCode.TABLE_REBUILD_NOT_SUPPORTED,
      });
    }

    const identitySequences: WorkspaceTableRebuildPlanIdentitySequence[] = [];

    for (const { columnName, sequenceName } of columns) {
      if (!isDefined(sequenceName)) {
        continue;
      }

      const [{ sequenceRelationName, lastValue, isCalled }]: Omit<
        WorkspaceTableRebuildPlanIdentitySequence,
        'columnName'
      >[] = await queryRunner.query(
        `SELECT (SELECT relname FROM pg_class WHERE oid = $1::regclass) AS "sequenceRelationName",
                last_value::text AS "lastValue",
                is_called AS "isCalled"
           FROM ${sequenceName}`,
        [sequenceName],
      );

      identitySequences.push({
        columnName,
        sequenceRelationName,
        lastValue,
        isCalled,
      });
    }

    const constraints: WorkspaceTableRebuildPlanConstraint[] =
      await queryRunner.query(
        `SELECT conname AS "constraintName",
                pg_get_constraintdef(oid) AS "definition"
           FROM pg_constraint
          WHERE conrelid = $1::regclass
            AND contype IN ('p', 'u', 'x', 'f')
          ORDER BY contype = 'f', conname`,
        [escapedQualifiedTableName],
      );

    const incomingForeignKeys: WorkspaceTableRebuildPlanIncomingForeignKey[] =
      await queryRunner.query(
        `SELECT quote_ident(n.nspname) || '.' || quote_ident(c.relname) AS "escapedQualifiedTableName",
                con.conname AS "constraintName",
                pg_get_constraintdef(con.oid) AS "definition"
           FROM pg_constraint con
           JOIN pg_class c ON c.oid = con.conrelid
           JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE con.confrelid = $1::regclass
            AND con.conrelid <> con.confrelid
            AND con.contype = 'f'
          ORDER BY c.relname, con.conname`,
        [escapedQualifiedTableName],
      );

    const indexes: { definition: string }[] = await queryRunner.query(
      `SELECT pg_get_indexdef(i.indexrelid) AS "definition"
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
        WHERE i.indrelid = $1::regclass
          AND NOT EXISTS (
            SELECT 1 FROM pg_constraint con WHERE con.conindid = i.indexrelid
          )
        ORDER BY c.relname`,
      [escapedQualifiedTableName],
    );

    return {
      copiedColumnNames: columns
        .filter(({ isGenerated }) => !isGenerated)
        .map(({ columnName }) => columnName),
      identitySequences,
      constraints,
      incomingForeignKeys,
      indexDefinitions: indexes.map(({ definition }) => definition),
    };
  }

  private async applyRebuildPlan({
    queryRunner,
    schemaName,
    tableName,
    workspaceTableRebuildPlan,
  }: WorkspaceTableArgs & {
    workspaceTableRebuildPlan: WorkspaceTableRebuildPlan;
  }): Promise<void> {
    const temporaryTableName = `${tableName.slice(
      0,
      IDENTIFIER_MAX_CHAR_LENGTH -
        WORKSPACE_TABLE_REBUILD_TEMPORARY_TABLE_NAME_SUFFIX.length,
    )}${WORKSPACE_TABLE_REBUILD_TEMPORARY_TABLE_NAME_SUFFIX}`;
    const escapedQualifiedTableName = getEscapedQualifiedTableName({
      schemaName,
      tableName,
    });
    const escapedQualifiedTemporaryTableName = getEscapedQualifiedTableName({
      schemaName,
      tableName: temporaryTableName,
    });
    const escapedColumnNames = workspaceTableRebuildPlan.copiedColumnNames
      .map(escapeIdentifier)
      .join(', ');

    await queryRunner.query(
      `CREATE TABLE ${escapedQualifiedTemporaryTableName} (
         LIKE ${escapedQualifiedTableName}
         INCLUDING DEFAULTS INCLUDING GENERATED INCLUDING IDENTITY
         INCLUDING CONSTRAINTS INCLUDING STORAGE INCLUDING COMMENTS
       )`,
    );

    await queryRunner.query(
      `INSERT INTO ${escapedQualifiedTemporaryTableName} (${escapedColumnNames})
       OVERRIDING SYSTEM VALUE
       SELECT ${escapedColumnNames} FROM ${escapedQualifiedTableName}`,
    );

    for (const {
      escapedQualifiedTableName: escapedQualifiedReferencingTableName,
      constraintName,
    } of workspaceTableRebuildPlan.incomingForeignKeys) {
      await queryRunner.query(
        `ALTER TABLE ${escapedQualifiedReferencingTableName} DROP CONSTRAINT ${escapeIdentifier(constraintName)}`,
      );
    }

    await queryRunner.query(`DROP TABLE ${escapedQualifiedTableName}`);

    await queryRunner.query(
      `ALTER TABLE ${escapedQualifiedTemporaryTableName} RENAME TO ${escapeIdentifier(tableName)}`,
    );

    for (const {
      columnName,
      sequenceRelationName,
      lastValue,
      isCalled,
    } of workspaceTableRebuildPlan.identitySequences) {
      const [{ sequenceName }]: { sequenceName: string }[] =
        await queryRunner.query(
          `SELECT pg_get_serial_sequence($1::text, $2::text) AS "sequenceName"`,
          [escapedQualifiedTableName, columnName],
        );

      await queryRunner.query(`SELECT setval($1::regclass, $2::bigint, $3)`, [
        sequenceName,
        lastValue,
        isCalled,
      ]);

      await queryRunner.query(
        `ALTER SEQUENCE ${sequenceName} RENAME TO ${escapeIdentifier(sequenceRelationName)}`,
      );
    }

    for (const {
      constraintName,
      definition,
    } of workspaceTableRebuildPlan.constraints) {
      await queryRunner.query(
        `ALTER TABLE ${escapedQualifiedTableName} ADD CONSTRAINT ${escapeIdentifier(constraintName)} ${definition}`,
      );
    }

    for (const indexDefinition of workspaceTableRebuildPlan.indexDefinitions) {
      await queryRunner.query(indexDefinition);
    }

    for (const {
      escapedQualifiedTableName: escapedQualifiedReferencingTableName,
      constraintName,
      definition,
    } of workspaceTableRebuildPlan.incomingForeignKeys) {
      await queryRunner.query(
        `ALTER TABLE ${escapedQualifiedReferencingTableName} ADD CONSTRAINT ${escapeIdentifier(constraintName)} ${definition}`,
      );
    }
  }
}
