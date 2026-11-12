/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import {
  ACCESS_GROUP_SYNC_LOCK_OPTIONS,
  buildAccessGroupSyncLockKey,
} from 'src/engine/permissions/internal/access-group/constants/access-group-sync-lock.constant';
import { RECOMPUTE_RECORD_ACCESS_GROUP_IDS_OF_RECORDS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-record-access-group-ids-of-records-job-name.constant';
import { type RecomputeRecordAccessGroupIdsOfRecordsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-of-records-job-data.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RelatedRecords } from 'src/engine/permissions/types/related-records.type';
import { buildRecordAccessGroupSQLConditions } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-sql-conditions.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { findRlsRuleRelationPredicatesToObject } from 'src/engine/permissions/internal/access-group/utils/find-rls-rule-relation-predicates-to-object.util';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { isRlsRuleRelationAffectedByUpdate } from 'src/engine/permissions/internal/access-group/utils/is-rls-rule-relation-affected-by-update.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { isPrivateRecordsEnabled } from 'src/engine/permissions/internal/private-record/utils/is-private-records-enabled.util';
import { type RelatedRecordPathAccessGroupSource } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-access-group-source.type';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';

const RECOMPUTE_BATCH_SIZE = 1_000;

@Injectable()
export class RecordAccessGroupComputationService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly accessGroupRepository: AccessGroupRepository,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly accessGroupPropagationPlanService: AccessGroupPropagationPlanService,
    @InjectMessageQueue(MessageQueue.accessGroupQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async recomputeRecordAccessGroupIdsOfAllObjectRecords({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.findAfterEvictingLocalCache(
        workspaceId,
      );

    if (
      !isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId })
    ) {
      return;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });

    let recordIds = await this.recordAccessGroupRepository.findRecordIds({
      workspaceId,
      flatObjectMetadata,
      afterRecordId: null,
      limit: RECOMPUTE_BATCH_SIZE,
    });

    while (isNonEmptyArray(recordIds)) {
      await this.recomputeRecordAccessGroupIdsOfRecords({
        workspaceId,
        objectMetadataId,
        recordIds,
      });
      await this.accessGroupPropagationPlanService.trackComputedRecords({
        workspaceId,
        recordCount: recordIds.length,
      });

      recordIds = await this.recordAccessGroupRepository.findRecordIds({
        workspaceId,
        flatObjectMetadata,
        afterRecordId: recordIds[recordIds.length - 1],
        limit: RECOMPUTE_BATCH_SIZE,
      });
    }
  }

  async recomputeRecordAccessGroupIdsOfRecords({
    workspaceId,
    objectMetadataId,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<string[]> {
    if (recordIds.length === 0) {
      return [];
    }

    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);

    if (
      !isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId })
    ) {
      return [];
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });
    const feedingRelatedRecordPaths = findRelatedRecordPathsFeedingAccessGroups(
      { ...metadataMaps, objectMetadataId },
    );
    const accessGroups = await this.findAccessGroupsOfObjects({
      workspaceId,
      objectMetadataIds: [
        objectMetadataId,
        ...feedingRelatedRecordPaths
          .filter(({ isInherent }) => !isInherent)
          .map(({ sourceFlatObjectMetadata }) => sourceFlatObjectMetadata.id),
      ],
      transactionScope,
    });
    const relatedRecordPathAccessGroupSources: RelatedRecordPathAccessGroupSource[] =
      feedingRelatedRecordPaths.map(
        ({ hops, isInherent, sourceFlatObjectMetadata }) => ({
          hops,
          sourceObjectCompactIds: isInherent
            ? null
            : accessGroups
                .filter(
                  (accessGroup) =>
                    accessGroup.objectMetadataId ===
                    sourceFlatObjectMetadata.id,
                )
                .map(({ compactId }) => compactId),
          isSourcePrivacyApplicable: isPrivateRecordsEnabled({
            flatObjectMetadata: sourceFlatObjectMetadata,
            featureFlagsMap: metadataMaps.featureFlagsMap,
          }),
        }),
      );

    return this.recordAccessGroupRepository.updateRecordAccessGroupIds({
      workspaceId,
      flatObjectMetadata,
      recordAccessGroupSQLConditions: buildRecordAccessGroupSQLConditions({
        flatObjectMetadata,
        metadataMaps,
        accessGroups: accessGroups.filter(
          (accessGroup) => accessGroup.objectMetadataId === objectMetadataId,
        ),
      }),
      relatedRecordPathAccessGroupSources,
      recordIds,
      transactionScope,
    });
  }

  async queueRecomputeRecordAccessGroupIdsOfRecords({
    workspaceId,
    objectMetadataId,
    recordIds,
    fromRelatedObjectMetadataIds,
  }: RecomputeRecordAccessGroupIdsOfRecordsJobData): Promise<void> {
    for (const recordIdsBatch of chunk(recordIds, RECOMPUTE_BATCH_SIZE)) {
      await this.messageQueueService.add<RecomputeRecordAccessGroupIdsOfRecordsJobData>(
        RECOMPUTE_RECORD_ACCESS_GROUP_IDS_OF_RECORDS_JOB_NAME,
        {
          workspaceId,
          objectMetadataId,
          recordIds: recordIdsBatch,
          fromRelatedObjectMetadataIds,
        },
        { isWorkspaceJob: true, workspaceId, retryLimit: 3 },
      );
    }
  }

  async isObjectUsingRecordAccessGroups({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<boolean> {
    return isObjectUsingRecordAccessGroups({
      ...(await this.recordAccessGroupMetadataMapsService.find(workspaceId)),
      objectMetadataId,
    });
  }

  async filterObjectsUsingRecordAccessGroups({
    workspaceId,
    objectMetadataIds,
  }: {
    workspaceId: string;
    objectMetadataIds: string[];
  }): Promise<string[]> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);

    return objectMetadataIds.filter((objectMetadataId) =>
      isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId }),
    );
  }

  async isObjectReferencedByRlsRuleRelation({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<boolean> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);

    return isNonEmptyArray(
      findRlsRuleRelationPredicatesToObject({
        ...metadataMaps,
        objectMetadataId,
      }),
    );
  }

  async findRelatedRecords({
    workspaceId,
    objectMetadataId,
    recordIds,
    recordsBefore,
    updatedColumnNames,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    recordsBefore: Record<string, unknown>[];
    updatedColumnNames?: string[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<RelatedRecords[]> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);
    const relationPredicates = findRlsRuleRelationPredicatesToObject({
      ...metadataMaps,
      objectMetadataId,
    });

    if (relationPredicates.length === 0) {
      return [];
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });
    const relatedRecords: RelatedRecords[] = [];

    const relationFieldMetadataIds = new Set(
      relationPredicates
        .map(({ relationFieldMetadataId }) => relationFieldMetadataId)
        .filter(isDefined),
    );

    for (const relationFieldMetadataId of relationFieldMetadataIds) {
      const relationFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: relationFieldMetadataId,
        flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
      });

      if (
        isDefined(updatedColumnNames) &&
        !isRlsRuleRelationAffectedByUpdate({
          relationFieldMetadata,
          comparedFieldMetadataIds: relationPredicates
            .filter(
              (predicate) =>
                predicate.relationFieldMetadataId === relationFieldMetadataId,
            )
            .map(({ fieldMetadataId }) => fieldMetadataId),
          updatedColumnNames,
          targetFlatObjectMetadata,
          flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
        })
      ) {
        continue;
      }

      const sourceFlatObjectMetadata =
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: relationFieldMetadata.objectMetadataId,
          flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
        });
      const { sourceColumnName, targetColumnName } =
        findRelationJoinColumnsOrThrow({
          relationFieldMetadata,
          flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
        });

      relatedRecords.push({
        objectMetadataId: sourceFlatObjectMetadata.id,
        recordIds: await this.recordAccessGroupRepository.findRelatedRecordIds({
          workspaceId,
          sourceFlatObjectMetadata,
          targetFlatObjectMetadata,
          sourceColumnName,
          targetColumnName,
          recordIds,
          recordsBefore,
          transactionScope,
        }),
      });
    }

    return relatedRecords;
  }

  private findAccessGroupsOfObjects({
    workspaceId,
    objectMetadataIds,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataIds: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<AccessGroup[]> {
    if (isDefined(transactionScope)) {
      return this.accessGroupRepository.findAccessGroupsOfObjects({
        workspaceId,
        objectMetadataIds,
        transactionScope,
      });
    }

    // The sync queues this job before writing, so groups are read once its writes are done
    return this.cacheLockService.withLock(
      () =>
        this.accessGroupRepository.findAccessGroupsOfObjects({
          workspaceId,
          objectMetadataIds,
        }),
      buildAccessGroupSyncLockKey(workspaceId),
      ACCESS_GROUP_SYNC_LOCK_OPTIONS,
    );
  }
}
