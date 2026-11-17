/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type FeatureFlagKey } from 'twenty-shared/types';

import { MAX_RECORDS_RECOMPUTED_IN_WRITE } from 'src/engine/permissions/internal/access-group/constants/max-records-recomputed-in-write.constant';
import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type RelatedRecords } from 'src/engine/permissions/types/related-records.type';
import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';

@Injectable()
export class RecordAccessGroupWriteService {
  constructor(
    private readonly recordAccessGroupComputationService: RecordAccessGroupComputationService,
    private readonly recordAccessGroupPropagationService: RecordAccessGroupPropagationService,
  ) {}

  async isWriteTransactionRequired({
    featureFlagsMap,
    workspaceId,
    objectMetadataId,
  }: {
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<boolean> {
    return (
      isAccessGroupsEnabled({ featureFlagsMap }) &&
      (await this.recordAccessGroupComputationService.isObjectUsingRecordAccessGroups(
        {
          workspaceId,
          objectMetadataId,
        },
      ))
    );
  }

  async isRecordsBeforeWriteRequired({
    featureFlagsMap,
    workspaceId,
    objectMetadataId,
  }: {
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<boolean> {
    return (
      isAccessGroupsEnabled({ featureFlagsMap }) &&
      ((await this.recordAccessGroupComputationService.isObjectReferencedByRlsRuleRelation(
        {
          workspaceId,
          objectMetadataId,
        },
      )) ||
        (await this.recordAccessGroupPropagationService.isObjectLeadingThroughRelatedRecordPath(
          {
            workspaceId,
            objectMetadataId,
          },
        )))
    );
  }

  async findRelatedRecordsBeforeDelete({
    featureFlagsMap,
    workspaceId,
    objectMetadataId,
    recordIds,
    recordsBefore,
    transactionScope,
  }: {
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    recordsBefore: Record<string, unknown>[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<RelatedRecords[]> {
    if (!isAccessGroupsEnabled({ featureFlagsMap })) {
      return [];
    }

    return [
      ...(await this.recordAccessGroupComputationService.findRelatedRecords({
        workspaceId,
        objectMetadataId,
        recordIds,
        recordsBefore,
        transactionScope,
      })),
      ...(await this.recordAccessGroupPropagationService.findRecordsFollowingRelatedRecordPaths(
        {
          workspaceId,
          objectMetadataId,
          changedRecordIds: recordIds,
          writtenRecordIds: recordIds,
          recordsBefore,
          transactionScope,
        },
      )),
    ];
  }

  async recomputeAfterWrite({
    featureFlagsMap,
    workspaceId,
    objectMetadataId,
    writtenRecordIds,
    isRecomputingWrittenRecords,
    recordsBefore,
    updatedColumnNames,
    relatedRecordsBeforeDelete,
    transactionScope,
  }: {
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
    workspaceId: string;
    objectMetadataId: string;
    writtenRecordIds: string[];
    isRecomputingWrittenRecords: boolean;
    recordsBefore: Record<string, unknown>[];
    updatedColumnNames?: string[];
    relatedRecordsBeforeDelete?: RelatedRecords[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<RelatedRecords[]> {
    if (!isAccessGroupsEnabled({ featureFlagsMap })) {
      return [];
    }

    const isRecomputingInWrite =
      isRecomputingWrittenRecords &&
      writtenRecordIds.length <= MAX_RECORDS_RECOMPUTED_IN_WRITE;

    const changedRecordIds = isRecomputingInWrite
      ? await this.recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfRecords(
          {
            workspaceId,
            objectMetadataId,
            recordIds: writtenRecordIds,
            transactionScope,
          },
        )
      : [];
    const relatedRecords = relatedRecordsBeforeDelete ?? [
      ...(await this.recordAccessGroupComputationService.findRelatedRecords({
        workspaceId,
        objectMetadataId,
        recordIds: writtenRecordIds,
        recordsBefore,
        updatedColumnNames,
        transactionScope,
      })),
      ...(await this.recordAccessGroupPropagationService.findRecordsFollowingRelatedRecordPaths(
        {
          workspaceId,
          objectMetadataId,
          changedRecordIds: isRecomputingWrittenRecords
            ? changedRecordIds
            : writtenRecordIds,
          writtenRecordIds,
          recordsBefore,
          transactionScope,
        },
      )),
    ];

    return isRecomputingWrittenRecords && !isRecomputingInWrite
      ? [{ objectMetadataId, recordIds: writtenRecordIds }, ...relatedRecords]
      : relatedRecords;
  }

  async queueRecompute({
    workspaceId,
    recordsToQueue,
  }: {
    workspaceId: string;
    recordsToQueue: RelatedRecords[];
  }): Promise<void> {
    for (const {
      objectMetadataId,
      recordIds,
      fromRelatedObjectMetadataIds,
    } of recordsToQueue) {
      if (
        await this.recordAccessGroupComputationService.isObjectUsingRecordAccessGroups(
          {
            workspaceId,
            objectMetadataId,
          },
        )
      ) {
        await this.recordAccessGroupComputationService.queueRecomputeRecordAccessGroupIdsOfRecords(
          {
            workspaceId,
            objectMetadataId,
            recordIds,
            fromRelatedObjectMetadataIds,
          },
        );
      }
    }
  }
}
