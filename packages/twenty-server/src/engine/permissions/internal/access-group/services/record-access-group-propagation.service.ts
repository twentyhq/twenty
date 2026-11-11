/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { type RecomputeRecordAccessGroupIdsOfRecordsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-of-records-job-data.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { type RelatedRecordPathFollowingLookup } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-following-lookup.type';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { type RelatedRecords } from 'src/engine/permissions/types/related-records.type';

@Injectable()
export class RecordAccessGroupPropagationService {
  constructor(
    private readonly recordAccessGroupComputationService: RecordAccessGroupComputationService,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
    private readonly accessGroupSyncSchedulerService: AccessGroupSyncSchedulerService,
  ) {}

  async recomputeRecordAccessGroupIdsOfAllObjectRecordsAndPropagate({
    workspaceId,
    objectMetadataId,
    propagatedFromObjectMetadataIds = [],
  }: RecomputeRecordAccessGroupIdsJobData): Promise<void> {
    await this.recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfAllObjectRecords(
      { workspaceId, objectMetadataId },
    );

    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);
    const followingObjectMetadataIds = new Set(
      metadataMaps.resolvedRelatedRecordPaths
        .filter(
          (resolvedPath) =>
            resolvedPath.sourceFlatObjectMetadata.id === objectMetadataId &&
            this.isRelatedRecordPathFollowed({
              resolvedPath,
              objectMetadataId,
              propagatedFromObjectMetadataIds,
            }),
        )
        .map(({ targetObjectMetadataId }) => targetObjectMetadataId),
    );

    await this.scheduleRecomputeOfObjectsUsingRecordAccessGroups({
      workspaceId,
      objectMetadataIds: followingObjectMetadataIds,
      propagatedFromObjectMetadataIds: [
        ...propagatedFromObjectMetadataIds,
        objectMetadataId,
      ],
      metadataMaps,
    });
  }

  async scheduleRecomputeOfRelatedRecordPathTargets({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.findAfterEvictingLocalCache(
        workspaceId,
      );

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

  async recomputeRecordAccessGroupIdsOfRecordsAndPropagate({
    workspaceId,
    objectMetadataId,
    recordIds,
    propagatedFromObjectMetadataIds = [],
  }: RecomputeRecordAccessGroupIdsOfRecordsJobData): Promise<void> {
    const changedRecordIds =
      await this.recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfRecords(
        {
          workspaceId,
          objectMetadataId,
          recordIds,
        },
      );

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
      await this.recordAccessGroupComputationService.queueRecomputeRecordAccessGroupIdsOfRecords(
        {
          workspaceId,
          ...followingRecords,
        },
      );
    }
  }

  // TODO(@charlesBochet): above MAX_RECORDS_RECOMPUTED_IN_WRITE, queue a job after commit once the transaction scope exposes afterCommit
  async recomputeRecordsFollowingRelatedRecordPathsInWrite({
    workspaceId,
    objectMetadataId,
    recordIds,
    propagatedFromObjectMetadataIds = [],
    transactionScope,
  }: RecomputeRecordAccessGroupIdsOfRecordsJobData & {
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    for (const followingRecords of await this.findRecordsFollowingRelatedRecordPaths(
      {
        workspaceId,
        objectMetadataId,
        changedRecordIds: recordIds,
        writtenRecordIds: recordIds,
        recordsBefore: [],
        propagatedFromObjectMetadataIds,
        transactionScope,
      },
    )) {
      await this.recomputeRecordsFollowingRelatedRecordPathsInWrite({
        workspaceId,
        objectMetadataId: followingRecords.objectMetadataId,
        recordIds:
          await this.recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfRecords(
            {
              workspaceId,
              objectMetadataId: followingRecords.objectMetadataId,
              recordIds: followingRecords.recordIds,
              transactionScope,
            },
          ),
        propagatedFromObjectMetadataIds:
          followingRecords.propagatedFromObjectMetadataIds,
        transactionScope,
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
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);
    const lookups: RelatedRecordPathFollowingLookup[] = [];

    for (const resolvedPath of this.findRelatedRecordPathsLeadingFromObject({
      metadataMaps,
      objectMetadataId,
    })) {
      const { hops, targetObjectMetadataId } = resolvedPath;

      if (
        !this.isRelatedRecordPathFollowed({
          resolvedPath,
          objectMetadataId,
          propagatedFromObjectMetadataIds,
        })
      ) {
        continue;
      }

      for (const [hopIndex, writtenHop] of hops.entries()) {
        if (writtenHop.flatObjectMetadata.id !== objectMetadataId) {
          continue;
        }

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

        lookups.push({
          targetFlatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: targetObjectMetadataId,
            flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
          }),
          writtenHop,
          followingHops: hops.slice(hopIndex + 1),
          recordIds,
          recordsBefore: recordsBeforeWrite,
        });
      }
    }

    const followingRecords =
      await this.recordAccessGroupRepository.findRecordsFollowingRelatedRecordPaths(
        { workspaceId, lookups, transactionScope },
      );
    const followingObjectMetadataIds = [
      ...new Set(
        followingRecords.map(
          (followingRecord) => followingRecord.objectMetadataId,
        ),
      ),
    ];

    return followingObjectMetadataIds.map((followingObjectMetadataId) => ({
      objectMetadataId: followingObjectMetadataId,
      recordIds: [
        ...new Set(
          followingRecords
            .filter(
              (followingRecord) =>
                followingRecord.objectMetadataId === followingObjectMetadataId,
            )
            .map(({ id }) => id),
        ),
      ],
      propagatedFromObjectMetadataIds: [
        ...propagatedFromObjectMetadataIds,
        objectMetadataId,
      ],
    }));
  }

  private isRelatedRecordPathFollowed({
    resolvedPath: { isInherent, targetObjectMetadataId },
    objectMetadataId,
    propagatedFromObjectMetadataIds,
  }: {
    resolvedPath: Pick<
      ResolvedRelatedRecordPath,
      'isInherent' | 'targetObjectMetadataId'
    >;
    objectMetadataId: string;
    propagatedFromObjectMetadataIds: string[];
  }): boolean {
    return (
      (isInherent || propagatedFromObjectMetadataIds.length === 0) &&
      targetObjectMetadataId !== objectMetadataId &&
      !propagatedFromObjectMetadataIds.includes(targetObjectMetadataId)
    );
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
        metadataMaps:
          await this.recordAccessGroupMetadataMapsService.find(workspaceId),
        objectMetadataId,
      }),
    );
  }

  private findRelatedRecordPathsLeadingFromObject({
    metadataMaps,
    objectMetadataId,
  }: {
    metadataMaps: Pick<
      RecordAccessGroupComputationMetadataMaps,
      'rolesPermissions' | 'resolvedRelatedRecordPaths'
    >;
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
}
