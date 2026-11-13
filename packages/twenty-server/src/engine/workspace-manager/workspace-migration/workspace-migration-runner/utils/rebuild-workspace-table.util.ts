import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { type QueryRunner } from 'typeorm';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { WORKSPACE_TABLE_REBUILD_TEMPORARY_TABLE_NAME_SUFFIX } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/workspace-table-rebuild-temporary-table-name-suffix.constant';
import { type WorkspaceTableRebuildPlan } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-table-rebuild-plan.type';
import { getEscapedQualifiedTableName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-escaped-qualified-table-name.util';

// Must run inside a transaction that already holds an ACCESS EXCLUSIVE lock on the table.
export const rebuildWorkspaceTable = async ({
  queryRunner,
  schemaName,
  tableName,
  workspaceTableRebuildPlan,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
  tableName: string;
  workspaceTableRebuildPlan: WorkspaceTableRebuildPlan;
}): Promise<void> => {
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

  // LIKE does not copy dropped columns, which is what frees their slots.
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

  // No CASCADE: anything this plan does not know how to restore aborts the rebuild.
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
};
