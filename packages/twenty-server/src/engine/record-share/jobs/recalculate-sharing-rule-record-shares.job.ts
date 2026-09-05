import { Logger, Scope } from '@nestjs/common';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule.type';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { compileSharingRuleCriteriaToSql } from 'src/engine/record-share/utils/compile-sharing-rule-criteria-to-sql.util';
import {
  type PositionalSqlStatement,
  convertNamedParametersToPositional,
} from 'src/engine/record-share/utils/convert-named-parameters-to-positional.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type RecalculateSharingRuleRecordSharesJobData = {
  workspaceId: string;
  sharingRuleIds: string[];
};

const RECALCULATION_CACHE_KEYS = [
  'flatSharingRuleMaps',
  'flatObjectMetadataMaps',
  'flatFieldMetadataMapsOrm',
  'flatRowLevelPermissionPredicateMaps',
  'flatRowLevelPermissionPredicateGroupMaps',
] as const;

const SOURCE_TABLE_ALIAS = 'r';
const RECORD_SHARE_TABLE_ALIAS = 'recordShare';
const SHARING_RULE_RECALCULATION_LOCK_PREFIX = 'sharing-rule-recalculation:';
const ACQUIRE_SHARING_RULE_RECALCULATION_LOCK_STATEMENT =
  'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))';

const resolvePrincipalId = (
  flatSharingRule: FlatSharingRule,
): string | null => {
  switch (flatSharingRule.granteePrincipalType) {
    case RecordSharePrincipalType.EVERYONE:
      return EVERYONE_PRINCIPAL_ID;
    case RecordSharePrincipalType.ROLE:
      return flatSharingRule.granteeRoleId;
    case RecordSharePrincipalType.WORKSPACE_MEMBER:
      return flatSharingRule.granteePrincipalId;
    default:
      return null;
  }
};

@Processor({ queueName: MessageQueue.recordShareQueue, scope: Scope.REQUEST })
export class RecalculateSharingRuleRecordSharesJob {
  private readonly logger = new Logger(
    RecalculateSharingRuleRecordSharesJob.name,
  );

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordShareService: RecordShareService,
  ) {}

  @Process(RecalculateSharingRuleRecordSharesJob.name)
  async handle({
    workspaceId,
    sharingRuleIds,
  }: RecalculateSharingRuleRecordSharesJobData): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const recordShareFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.recordShare.universalIdentifier,
      });

    if (!isDefined(recordShareFlatObjectMetadata)) {
      this.logger.warn(
        `recordShare object not found for workspace ${workspaceId}, skipping sharing rule recalculation`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const recordShareTableExpression = `${escapeIdentifier(schemaName)}.${escapeIdentifier(computeObjectTargetTable(recordShareFlatObjectMetadata))}`;

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        for (const sharingRuleId of new Set(sharingRuleIds)) {
          await this.workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              await transactionScope.executeRawQuery(
                ACQUIRE_SHARING_RULE_RECALCULATION_LOCK_STATEMENT,
                [`${SHARING_RULE_RECALCULATION_LOCK_PREFIX}${sharingRuleId}`],
              );

              const statements = await this.buildStatements({
                workspaceId,
                sharingRuleId,
                schemaName,
                recordShareTableExpression,
              });

              if (!isDefined(statements)) {
                await this.recordShareService.deleteBySourceId({
                  workspaceId,
                  sourceId: sharingRuleId,
                  transactionScope,
                });

                return;
              }

              await transactionScope.executeRawQuery(
                statements.deleteStaleRows.sql,
                statements.deleteStaleRows.values,
              );
              await transactionScope.executeRawQuery(
                statements.insertMissingRows.sql,
                statements.insertMissingRows.values,
              );
            },
          );
        }
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  private async buildStatements({
    workspaceId,
    sharingRuleId,
    schemaName,
    recordShareTableExpression,
  }: {
    workspaceId: string;
    sharingRuleId: string;
    schemaName: string;
    recordShareTableExpression: string;
  }): Promise<{
    deleteStaleRows: PositionalSqlStatement;
    insertMissingRows: PositionalSqlStatement;
  } | null> {
    const maps = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      ...RECALCULATION_CACHE_KEYS,
    ]);

    const flatSharingRule = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: sharingRuleId,
      flatEntityMaps: maps.flatSharingRuleMaps,
    });

    if (
      !isDefined(flatSharingRule) ||
      !flatSharingRule.isActive ||
      isDefined(flatSharingRule.deletedAt)
    ) {
      return null;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatSharingRule.objectMetadataId,
      flatEntityMaps: maps.flatObjectMetadataMaps,
    });
    const principalId = resolvePrincipalId(flatSharingRule);

    if (!isDefined(flatObjectMetadata) || !isDefined(principalId)) {
      return null;
    }

    const criteria = compileSharingRuleCriteriaToSql({
      sharingRuleId,
      tableAlias: SOURCE_TABLE_ALIAS,
      objectMetadata: flatObjectMetadata,
      flatFieldMetadataMaps: maps.flatFieldMetadataMapsOrm,
      flatRowLevelPermissionPredicateMaps:
        maps.flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps:
        maps.flatRowLevelPermissionPredicateGroupMaps,
    });

    const sourceTableExpression = `${escapeIdentifier(schemaName)}.${escapeIdentifier(computeObjectTargetTable(flatObjectMetadata))}`;
    const sourceAlias = escapeIdentifier(SOURCE_TABLE_ALIAS);
    const recordShareAlias = escapeIdentifier(RECORD_SHARE_TABLE_ALIAS);
    const grantedRecordsCondition = `${sourceAlias}."deletedAt" IS NULL AND (${criteria.sql})`;
    const parameters = {
      objectMetadataId: flatObjectMetadata.id,
      principalId,
      principalType: flatSharingRule.granteePrincipalType,
      accessLevel: flatSharingRule.accessLevel,
      rowCause: RecordShareRowCause.RULE,
      sourceId: sharingRuleId,
      ...criteria.parameters,
    };

    return {
      deleteStaleRows: convertNamedParametersToPositional({
        sql: `DELETE FROM ${recordShareTableExpression} AS ${recordShareAlias}
WHERE ${recordShareAlias}."sourceId" = :sourceId
AND (${recordShareAlias}."objectMetadataId" <> :objectMetadataId
  OR ${recordShareAlias}."principalId" <> :principalId
  OR ${recordShareAlias}."principalType" <> :principalType
  OR ${recordShareAlias}."accessLevel" <> :accessLevel
  OR NOT EXISTS (SELECT 1 FROM ${sourceTableExpression} ${sourceAlias}
    WHERE ${sourceAlias}."id" = ${recordShareAlias}."recordId" AND ${grantedRecordsCondition}))`,
        parameters,
      }),
      insertMissingRows: convertNamedParametersToPositional({
        sql: `INSERT INTO ${recordShareTableExpression} ("id", "recordId", "objectMetadataId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), ${sourceAlias}."id", :objectMetadataId, :principalId, :principalType, :accessLevel, :rowCause, :sourceId, now(), now()
FROM ${sourceTableExpression} ${sourceAlias}
WHERE ${grantedRecordsCondition}
AND NOT EXISTS (SELECT 1 FROM ${recordShareTableExpression} ${recordShareAlias}
  WHERE ${recordShareAlias}."sourceId" = :sourceId AND ${recordShareAlias}."recordId" = ${sourceAlias}."id")
ON CONFLICT DO NOTHING`,
        parameters,
      }),
    };
  }
}
