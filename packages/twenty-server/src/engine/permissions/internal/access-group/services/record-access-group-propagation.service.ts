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
    const recomputedObjectMetadataIds = [
      ...propagatedFromObjectMetadataIds,
      objectMetadataId,
    ];
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
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);

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
}
