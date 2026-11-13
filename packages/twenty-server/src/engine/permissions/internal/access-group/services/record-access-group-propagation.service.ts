/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';
import { RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { type ApplyAccessGroupPropagationPlanJobData } from 'src/engine/permissions/internal/access-group/types/apply-access-group-propagation-plan-job-data.type';
import { type RecomputeRecordAccessGroupIdsOfRecordsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-of-records-job-data.type';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { isRelatedRecordPathFollowed } from 'src/engine/permissions/internal/access-group/utils/is-related-record-path-followed.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { type RelatedRecordPathFollowingLookup } from 'src/engine/permissions/internal/record-permission-repository/types/related-record-path-following-lookup.type';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { type RelatedRecords } from 'src/engine/permissions/types/related-records.type';

@Injectable()
export class RecordAccessGroupPropagationService {
  private readonly logger = new Logger(
    RecordAccessGroupPropagationService.name,
  );

  constructor(
    private readonly recordAccessGroupComputationService: RecordAccessGroupComputationService,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
    private readonly accessGroupPropagationPlanService: AccessGroupPropagationPlanService,
  ) {}

  async computeNextPlannedObject(
    applyJobData: ApplyAccessGroupPropagationPlanJobData,
  ): Promise<void> {
    const { workspaceId } = applyJobData;
    const objectMetadataId =
      await this.accessGroupPropagationPlanService.findNextObjectMetadataIdToCompute(
        applyJobData,
      );

    if (!isDefined(objectMetadataId)) {
      return;
    }

    const computeObject = () =>
      this.recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfAllObjectRecords(
        { workspaceId, objectMetadataId },
      );

    try {
      await computeObject().catch((error) => {
        this.logger.warn(
          `Retrying the access group compute of object ${objectMetadataId} in workspace ${workspaceId}: ${error}`,
        );

        return computeObject();
      });
    } catch (error) {
      await this.accessGroupPropagationPlanService.stopPlan(workspaceId);

      throw error;
    }

    await this.accessGroupPropagationPlanService.finishCompute({
      applyJobData,
      objectMetadataId,
    });
  }

  async planAndApplyRecomputeOfRelatedRecordPathTargets({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.findAfterEvictingLocalCache(
        workspaceId,
      );
    const objectMetadataIds = new Set(
      metadataMaps.resolvedRelatedRecordPaths.map(
        ({ targetObjectMetadataId }) => targetObjectMetadataId,
      ),
    );

    await this.accessGroupPropagationPlanService.planAndApplyComputes({
      workspaceId,
      objectMetadataIds: [...objectMetadataIds].filter((objectMetadataId) =>
        isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId }),
      ),
    });
  }

  async recomputeRecordAccessGroupIdsOfRecordsAndPropagate({
    workspaceId,
    objectMetadataId,
    recordIds,
    fromRelatedObjectMetadataIds = [],
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
        fromRelatedObjectMetadataIds,
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
    fromRelatedObjectMetadataIds = [],
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
        fromRelatedObjectMetadataIds,
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
        fromRelatedObjectMetadataIds:
          followingRecords.fromRelatedObjectMetadataIds,
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
    fromRelatedObjectMetadataIds = [],
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    changedRecordIds: string[];
    writtenRecordIds: string[];
    recordsBefore: Record<string, unknown>[];
    fromRelatedObjectMetadataIds?: string[];
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
        !isRelatedRecordPathFollowed({
          resolvedPath,
          objectMetadataId,
          fromRelatedObjectMetadataIds,
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
      fromRelatedObjectMetadataIds: [
        ...fromRelatedObjectMetadataIds,
        objectMetadataId,
      ],
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
}
