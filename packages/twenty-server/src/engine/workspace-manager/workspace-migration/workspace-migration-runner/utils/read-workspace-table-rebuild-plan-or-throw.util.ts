import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import {
  type WorkspaceTableRebuildPlan,
  type WorkspaceTableRebuildPlanConstraint,
  type WorkspaceTableRebuildPlanIdentitySequence,
  type WorkspaceTableRebuildPlanIncomingForeignKey,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-table-rebuild-plan.type';
import { getEscapedQualifiedTableName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-escaped-qualified-table-name.util';

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

export const readWorkspaceTableRebuildPlanOrThrow = async ({
  queryRunner,
  schemaName,
  tableName,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
  tableName: string;
}): Promise<WorkspaceTableRebuildPlan> => {
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
};
