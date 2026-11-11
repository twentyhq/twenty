/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { FeatureFlagKey } from 'twenty-shared/types';
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
import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type RelatedRecords } from 'src/engine/permissions/types/related-records.type';
import { buildRecordAccessGroupSQLConditions } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-sql-conditions.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { findRlsRuleRelationPredicatesToObject } from 'src/engine/permissions/internal/access-group/utils/find-rls-rule-relation-predicates-to-object.util';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { isRlsRuleRelationAffectedByUpdate } from 'src/engine/permissions/internal/access-group/utils/is-rls-rule-relation-affected-by-update.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { arePrivateRecordsEnabled } from 'src/engine/permissions/internal/private-record/utils/are-private-records-enabled.util';
import { type RelatedRecordPathAccessGroupSource } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-access-group-source.type';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const RECOMPUTE_BATCH_SIZE = 1_000;

type RecordAccessGroupComputationMetadataMaps =
  RecordAccessGroupSQLConditionMetadataMaps & {
    resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
  };

@Injectable()
export class RecordAccessGroupComputationService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupRepository: AccessGroupRepository,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
    private readonly accessGroupSyncSchedulerService: AccessGroupSyncSchedulerService,
    @InjectMessageQueue(MessageQueue.accessGroupQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async recomputeRecordAccessGroupIdsOfAllObjectRecords({
    workspaceId,
    objectMetadataId,
    propagatedFromObjectMetadataIds = [],
  }: RecomputeRecordAccessGroupIdsJobData): Promise<void> {
    await this.workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);

    const metadataMaps = await this.findMetadataMaps(workspaceId);

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

      recordIds = await this.recordAccessGroupRepository.findRecordIds({
        workspaceId,
        flatObjectMetadata,
        afterRecordId: recordIds[recordIds.length - 1],
        limit: RECOMPUTE_BATCH_SIZE,
      });
    }

    const recomputedObjectMetadataIds = [
      ...propagatedFromObjectMetadataIds,
      objectMetadataId,
    ];
    // Regular paths pass on own groups only, which a propagated recompute leaves unchanged
    const followingObjectMetadataIds = new Set(
      metadataMaps.resolvedRelatedRecordPaths
        .filter(
          ({ isInherent, sourceFlatObjectMetadata, targetObjectMetadataId }) =>
            sourceFlatObjectMetadata.id === objectMetadataId &&
            (isInherent || propagatedFromObjectMetadataIds.length === 0) &&
            !recomputedObjectMetadataIds.includes(targetObjectMetadataId),
        )
        .map(({ targetObjectMetadataId }) => targetObjectMetadataId),
    );

    await this.scheduleRecomputeOfObjectsUsingRecordAccessGroups({
      workspaceId,
      objectMetadataIds: followingObjectMetadataIds,
      propagatedFromObjectMetadataIds: recomputedObjectMetadataIds,
      metadataMaps,
    });
  }

  async scheduleRecomputeOfRelatedRecordPathTargets({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const metadataMaps = await this.findMetadataMaps(workspaceId);

    await this.scheduleRecomputeOfObjectsUsingRecordAccessGroups({
      workspaceId,
      objectMetadataIds: new Set(
        metadataMaps.resolvedRelatedRecordPaths.map(
          ({ targetObjectMetadataId }) => targetObjectMetadataId,
        ),
      ),
      propagatedFromObjectMetadataIds: [],
      metadataMaps,
    });
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

    const metadataMaps = await this.findMetadataMaps(workspaceId);

    if (
      !isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId })
    ) {
      return [];
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });
    const relatedRecordPathAccessGroupSources: RelatedRecordPathAccessGroupSource[] =
      [];

    for (const resolvedPath of findRelatedRecordPathsFeedingAccessGroups({
      ...metadataMaps,
      objectMetadataId,
    })) {
      relatedRecordPathAccessGroupSources.push({
        resolvedPath,
        sourceObjectCompactIds: resolvedPath.isInherent
          ? null
          : (
              await this.findObjectAccessGroups({
                workspaceId,
                objectMetadataId: resolvedPath.sourceFlatObjectMetadata.id,
                transactionScope,
              })
            ).map(({ compactId }) => compactId),
        isSourcePrivacyApplicable: arePrivateRecordsEnabled({
          flatObjectMetadata: resolvedPath.sourceFlatObjectMetadata,
          featureFlagsMap: metadataMaps.featureFlagsMap,
        }),
      });
    }

    return this.recordAccessGroupRepository.updateRecordAccessGroupIds({
      workspaceId,
      flatObjectMetadata,
      recordAccessGroupSQLConditions: buildRecordAccessGroupSQLConditions({
        flatObjectMetadata,
        metadataMaps,
        accessGroups: await this.findObjectAccessGroups({
          workspaceId,
          objectMetadataId,
          transactionScope,
        }),
      }),
      relatedRecordPathAccessGroupSources,
      recordIds,
      transactionScope,
    });
  }

  async recomputeRecordAccessGroupIdsOfRecordsAndPropagate({
    workspaceId,
    objectMetadataId,
    recordIds,
    propagatedFromObjectMetadataIds = [],
  }: RecomputeRecordAccessGroupIdsOfRecordsJobData): Promise<void> {
    const changedRecordIds = await this.recomputeRecordAccessGroupIdsOfRecords({
      workspaceId,
      objectMetadataId,
      recordIds,
    });

    for (const followingRecords of await this.findRecordsFollowingRelatedRecordPaths(
      {
        workspaceId,
        objectMetadataId,
        changedRecordIds,
        writtenRecordIds: changedRecordIds,
        recordsBefore: [],
        propagatedFromObjectMetadataIds,
      },
    )) {
      await this.queueRecomputeRecordAccessGroupIdsOfRecords({
        workspaceId,
        ...followingRecords,
      });
    }
  }

  async findRecordsFollowingRelatedRecordPaths({
    workspaceId,
    objectMetadataId,
    changedRecordIds,
    writtenRecordIds,
    recordsBefore,
    propagatedFromObjectMetadataIds = [],
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    changedRecordIds: string[];
    writtenRecordIds: string[];
    recordsBefore: Record<string, unknown>[];
    propagatedFromObjectMetadataIds?: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<RelatedRecords[]> {
    const metadataMaps = await this.findMetadataMaps(workspaceId);
    const recomputedObjectMetadataIds = [
      ...propagatedFromObjectMetadataIds,
      objectMetadataId,
    ];
    const followingRecordIdsByObjectMetadataId = new Map<string, Set<string>>();

    for (const resolvedPath of this.findRelatedRecordPathsLeadingFromObject({
      metadataMaps,
      objectMetadataId,
    })) {
      const { hops, isInherent, targetObjectMetadataId } = resolvedPath;

      if (
        recomputedObjectMetadataIds.includes(targetObjectMetadataId) ||
        (!isInherent && propagatedFromObjectMetadataIds.length > 0)
      ) {
        continue;
      }

      for (const [hopIndex, writtenHop] of hops.entries()) {
        if (writtenHop.flatObjectMetadata.id !== objectMetadataId) {
          continue;
        }

        // A source joined by its id reaches the same records before and after, so only a change of its groups matters
        const isOnlyFollowedWhenChanged =
          hopIndex === 0 && writtenHop.sourceColumnName === 'id';
        const recordIds = isOnlyFollowedWhenChanged
          ? changedRecordIds
          : writtenRecordIds;
        const recordsBeforeWrite = isOnlyFollowedWhenChanged
          ? []
          : recordsBefore;

        if (recordIds.length === 0 && recordsBeforeWrite.length === 0) {
          continue;
        }

        const followingRecordIds =
          await this.recordAccessGroupRepository.findRecordIdsFollowingRelatedRecordPath(
            {
              workspaceId,
              targetFlatObjectMetadata:
                findFlatEntityByIdInFlatEntityMapsOrThrow({
                  flatEntityId: targetObjectMetadataId,
                  flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
                }),
              writtenHop,
              followingHops: hops.slice(hopIndex + 1),
              recordIds,
              recordsBefore: recordsBeforeWrite,
              transactionScope,
            },
          );

        followingRecordIdsByObjectMetadataId.set(
          targetObjectMetadataId,
          new Set([
            ...(followingRecordIdsByObjectMetadataId.get(
              targetObjectMetadataId,
            ) ?? []),
            ...followingRecordIds,
          ]),
        );
      }
    }

    return [...followingRecordIdsByObjectMetadataId.entries()]
      .filter(([, recordIds]) => recordIds.size > 0)
      .map(([followingObjectMetadataId, recordIds]) => ({
        objectMetadataId: followingObjectMetadataId,
        recordIds: [...recordIds],
        propagatedFromObjectMetadataIds: recomputedObjectMetadataIds,
      }));
  }

  async isObjectLeadingThroughRelatedRecordPath({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<boolean> {
    return isNonEmptyArray(
      this.findRelatedRecordPathsLeadingFromObject({
        metadataMaps: await this.findMetadataMaps(workspaceId),
        objectMetadataId,
      }),
    );
  }

  async queueRecomputeRecordAccessGroupIdsOfRecords({
    workspaceId,
    objectMetadataId,
    recordIds,
    propagatedFromObjectMetadataIds,
  }: RecomputeRecordAccessGroupIdsOfRecordsJobData): Promise<void> {
    for (const recordIdsBatch of chunk(recordIds, RECOMPUTE_BATCH_SIZE)) {
      await this.messageQueueService.add<RecomputeRecordAccessGroupIdsOfRecordsJobData>(
        RECOMPUTE_RECORD_ACCESS_GROUP_IDS_OF_RECORDS_JOB_NAME,
        {
          workspaceId,
          objectMetadataId,
          recordIds: recordIdsBatch,
          propagatedFromObjectMetadataIds,
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
      ...(await this.findMetadataMaps(workspaceId)),
      objectMetadataId,
    });
  }

  async isObjectReachedByRlsRuleRelation({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<boolean> {
    const metadataMaps = await this.findMetadataMaps(workspaceId);

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
    const metadataMaps = await this.findMetadataMaps(workspaceId);
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

  private findObjectAccessGroups({
    workspaceId,
    objectMetadataId,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<AccessGroup[]> {
    if (isDefined(transactionScope)) {
      return this.accessGroupRepository.findObjectAccessGroups({
        workspaceId,
        objectMetadataId,
        transactionScope,
      });
    }

    // The sync queues this job before writing, so groups are read once its writes are done
    return this.cacheLockService.withLock(
      () =>
        this.accessGroupRepository.findObjectAccessGroups({
          workspaceId,
          objectMetadataId,
        }),
      buildAccessGroupSyncLockKey(workspaceId),
      ACCESS_GROUP_SYNC_LOCK_OPTIONS,
    );
  }

  private findRelatedRecordPathsLeadingFromObject({
    metadataMaps,
    objectMetadataId,
  }: {
    metadataMaps: RecordAccessGroupComputationMetadataMaps;
    objectMetadataId: string;
  }): ResolvedRelatedRecordPath[] {
    return metadataMaps.resolvedRelatedRecordPaths.filter(
      (resolvedPath) =>
        resolvedPath.hops.some(
          ({ flatObjectMetadata }) =>
            flatObjectMetadata.id === objectMetadataId,
        ) &&
        findRelatedRecordPathsFeedingAccessGroups({
          ...metadataMaps,
          objectMetadataId: resolvedPath.targetObjectMetadataId,
        }).includes(resolvedPath),
    );
  }

  private async scheduleRecomputeOfObjectsUsingRecordAccessGroups({
    workspaceId,
    objectMetadataIds,
    propagatedFromObjectMetadataIds,
    metadataMaps,
  }: {
    workspaceId: string;
    objectMetadataIds: Set<string>;
    propagatedFromObjectMetadataIds: string[];
    metadataMaps: RecordAccessGroupComputationMetadataMaps;
  }): Promise<void> {
    for (const objectMetadataId of objectMetadataIds) {
      if (
        isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId })
      ) {
        await this.accessGroupSyncSchedulerService.scheduleRecordAccessGroupIdsRecompute(
          { workspaceId, objectMetadataId, propagatedFromObjectMetadataIds },
        );
      }
    }
  }

  private async findMetadataMaps(
    workspaceId: string,
  ): Promise<RecordAccessGroupComputationMetadataMaps> {
    const metadataMaps = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        'featureFlagsMap',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'rolesPermissions',
      ],
    );
    const flatRelatedRecordPathMaps =
      metadataMaps.featureFlagsMap[
        FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED
      ] === true
        ? (
            await this.workspaceCacheService.getOrRecompute(workspaceId, [
              'flatRelatedRecordPathMaps',
            ])
          ).flatRelatedRecordPathMaps
        : undefined;

    return {
      ...metadataMaps,
      resolvedRelatedRecordPaths: resolveRelatedRecordPaths({
        ...metadataMaps,
        flatRelatedRecordPathMaps,
      }),
    };
  }
}
