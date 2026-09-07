import { Logger, Scope } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
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
import { findOwnerField } from 'src/engine/record-share/utils/find-owner-field.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type RebuildOwnerRecordSharesJobData = {
  workspaceId: string;
  objectMetadataId: string;
};

const OWNER_RECORD_SHARES_LOCK_PREFIX = 'owner-record-shares:';
const ACQUIRE_OWNER_RECORD_SHARES_LOCK_STATEMENT =
  'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))';

// Changing the owner field of an object changes who every OWNER row should
// name, so the rows are rebuilt from the records rather than patched
@Processor({ queueName: MessageQueue.recordShareQueue, scope: Scope.REQUEST })
export class RebuildOwnerRecordSharesJob {
  private readonly logger = new Logger(RebuildOwnerRecordSharesJob.name);

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  @Process(RebuildOwnerRecordSharesJob.name)
  async handle({
    workspaceId,
    objectMetadataId,
  }: RebuildOwnerRecordSharesJobData): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMapsOrm } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]);

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
    const recordShareFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.recordShare.universalIdentifier,
      });

    if (
      !isDefined(flatObjectMetadata) ||
      !isDefined(recordShareFlatObjectMetadata)
    ) {
      this.logger.warn(
        `Object ${objectMetadataId} or recordShare object not found for workspace ${workspaceId}, skipping owner record share rebuild`,
      );

      return;
    }

    const ownerField = findOwnerField({
      flatObjectMetadata,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
    });
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const recordShareTableExpression = `${schemaName}.${escapeIdentifier(computeObjectTargetTable(recordShareFlatObjectMetadata))}`;
    const sourceTableExpression = `${schemaName}.${escapeIdentifier(computeObjectTargetTable(flatObjectMetadata))}`;

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            await transactionScope.executeRawQuery(
              ACQUIRE_OWNER_RECORD_SHARES_LOCK_STATEMENT,
              [`${OWNER_RECORD_SHARES_LOCK_PREFIX}${objectMetadataId}`],
            );
            await transactionScope.executeRawQuery(
              `DELETE FROM ${recordShareTableExpression} WHERE "objectMetadataId" = $1 AND "rowCause" = $2`,
              [objectMetadataId, RecordShareRowCause.OWNER],
            );

            if (!isDefined(ownerField)) {
              return;
            }

            const ownerColumn = escapeIdentifier(ownerField.joinColumnName);

            await transactionScope.executeRawQuery(
              `INSERT INTO ${recordShareTableExpression} ("id", "recordId", "objectMetadataId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "r"."id", $1, "r".${ownerColumn}, $2, $3, $4, "r"."id", now(), now()
FROM ${sourceTableExpression} "r"
WHERE "r".${ownerColumn} IS NOT NULL AND "r"."deletedAt" IS NULL
ON CONFLICT DO NOTHING`,
              [
                objectMetadataId,
                RecordSharePrincipalType.WORKSPACE_MEMBER,
                RecordShareAccessLevel.FULL,
                RecordShareRowCause.OWNER,
              ],
            );
          },
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}
