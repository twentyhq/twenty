/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  ACCESS_GROUP_SYNC_LOCK_OPTIONS,
  buildAccessGroupSyncLockKey,
} from 'src/engine/permissions/internal/access-group/constants/access-group-sync-lock.constant';
import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';
import { RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { buildWorkspaceAccessGroups } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-groups.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { MAX_INCREMENTAL_ACCESS_GROUP_CHANGES_PER_OBJECT } from 'src/engine/permissions/internal/access-group/constants/max-incremental-access-group-changes-per-object.constant';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { buildRecordAccessGroupSQLConditions } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-sql-conditions.util';
import { findLookupRuleShapeHashesByObjectMetadataId } from 'src/engine/permissions/internal/access-group/utils/find-lookup-rule-shape-hashes-by-object-metadata-id.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planAccessGroupSyncRecomputes } from 'src/engine/permissions/internal/access-group/utils/plan-access-group-sync-recomputes.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';

@Injectable()
export class AccessGroupSyncService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupRepository: AccessGroupRepository,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
    private readonly recordAccessGroupComputationService: RecordAccessGroupComputationService,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly recordAccessGroupPropagationService: RecordAccessGroupPropagationService,
    private readonly accessGroupPropagationPlanService: AccessGroupPropagationPlanService,
  ) {}

  async syncAccessGroups(workspaceId: string): Promise<void> {
    await this.cacheLockService.withLock(
      () => this.syncAccessGroupsWithLock(workspaceId),
      buildAccessGroupSyncLockKey(workspaceId),
      ACCESS_GROUP_SYNC_LOCK_OPTIONS,
    );
  }

  private async syncAccessGroupsWithLock(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);

    const workspaceCache = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        'featureFlagsMap',
        'rolesPermissions',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'userWorkspaceRoleMap',
        'flatWorkspaceMemberMaps',
      ],
    );
    const { accessGroups: newAccessGroups, hasFailures } =
      buildWorkspaceAccessGroups(workspaceCache);

    const existingAccessGroups =
      await this.accessGroupRepository.findAccessGroups(workspaceId);
    const existingGroupHashes = new Set(
      existingAccessGroups.map(({ groupHash }) => groupHash),
    );
    const newGroupHashes = new Set(
      newAccessGroups.map(({ groupHash }) => groupHash),
    );
    const accessGroupsToInsert = newAccessGroups.filter(
      ({ groupHash }) => !existingGroupHashes.has(groupHash),
    );
    const canDeleteStaleAccessGroups =
      !hasFailures && newAccessGroups.length > 0;
    const staleAccessGroups = existingAccessGroups.filter(
      ({ groupHash }) =>
        canDeleteStaleAccessGroups && !newGroupHashes.has(groupHash),
    );

    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);
    const changedAccessGroups = [
      ...accessGroupsToInsert,
      ...staleAccessGroups,
    ].filter(({ objectMetadataId }) =>
      isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId }),
    );
    const { fullRecomputeObjectMetadataIds, incrementalObjectMetadataIds } =
      planAccessGroupSyncRecomputes({
        changedAccessGroups,
        lookupRuleShapeHashesByObjectMetadataId:
          findLookupRuleShapeHashesByObjectMetadataId({
            objectMetadataIds: changedAccessGroups.map(
              ({ objectMetadataId }) => objectMetadataId,
            ),
            metadataMaps,
          }),
        maxIncrementalChangesPerObject:
          MAX_INCREMENTAL_ACCESS_GROUP_CHANGES_PER_OBJECT,
      });

    await this.accessGroupPropagationPlanService.planAndApplyComputes({
      workspaceId,
      objectMetadataIds: fullRecomputeObjectMetadataIds,
    });

    const insertedAccessGroups =
      await this.accessGroupRepository.insertAccessGroups({
        workspaceId,
        newAccessGroups: accessGroupsToInsert,
      });

    if (isNonEmptyArray(staleAccessGroups)) {
      await this.accessGroupRepository.deleteAccessGroups({
        workspaceId,
        groupHashes: staleAccessGroups.map(({ groupHash }) => groupHash),
      });
    }

    for (const objectMetadataId of incrementalObjectMetadataIds) {
      await this.applyIncrementalChanges({
        workspaceId,
        objectMetadataId,
        metadataMaps,
        insertedAccessGroups: insertedAccessGroups.filter(
          (accessGroup) => accessGroup.objectMetadataId === objectMetadataId,
        ),
        staleCompactIds: staleAccessGroups
          .filter(
            (accessGroup) => accessGroup.objectMetadataId === objectMetadataId,
          )
          .map(({ compactId }) => compactId),
      });
    }
  }

  private async applyIncrementalChanges({
    workspaceId,
    objectMetadataId,
    metadataMaps,
    insertedAccessGroups,
    staleCompactIds,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    metadataMaps: RecordAccessGroupComputationMetadataMaps;
    insertedAccessGroups: AccessGroup[];
    staleCompactIds: number[];
  }): Promise<void> {
    if (isNonEmptyArray(staleCompactIds)) {
      for (const plannedObjectMetadataId of new Set(
        planRecordAccessGroupComputes({
          objectMetadataIds: [objectMetadataId],
          resolvedRelatedRecordPaths: metadataMaps.resolvedRelatedRecordPaths,
          isObjectUsingRecordAccessGroups: (candidateObjectMetadataId) =>
            isObjectUsingRecordAccessGroups({
              ...metadataMaps,
              objectMetadataId: candidateObjectMetadataId,
            }),
        }),
      )) {
        await this.recordAccessGroupRepository.removeAccessGroupIdsFromRecords({
          workspaceId,
          flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: plannedObjectMetadataId,
            flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
          }),
          compactIds: staleCompactIds,
        });
      }
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });
    const changedRecordIds =
      await this.recordAccessGroupRepository.addAccessGroupIdsToMatchingRecords(
        {
          workspaceId,
          flatObjectMetadata,
          recordAccessGroupSQLConditions: buildRecordAccessGroupSQLConditions({
            flatObjectMetadata,
            metadataMaps,
            accessGroups: insertedAccessGroups,
          }),
        },
      );

    for (const followingRecords of await this.recordAccessGroupPropagationService.findRecordsFollowingRelatedRecordPaths(
      {
        workspaceId,
        objectMetadataId,
        changedRecordIds,
        writtenRecordIds: changedRecordIds,
        recordsBefore: [],
      },
    )) {
      await this.recordAccessGroupComputationService.queueRecomputeRecordAccessGroupIdsOfRecords(
        { workspaceId, ...followingRecords },
      );
    }
  }
}
