/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type FeatureFlagKey } from 'twenty-shared/types';

import { MAX_RECORDS_RECOMPUTED_IN_WRITE } from 'src/engine/permissions/internal/access-group/constants/max-records-recomputed-in-write.constant';
import { RecordAccessGroupService } from 'src/engine/permissions/internal/access-group/services/record-access-group.service';
import { type RelatedRecords } from 'src/engine/permissions/internal/access-group/types/related-records.type';
import { areRecordAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/are-record-access-groups-enabled.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';

@Injectable()
export class RecordAccessGroupWriteService {
  constructor(
    private readonly recordAccessGroupService: RecordAccessGroupService,
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
      areRecordAccessGroupsEnabled({ featureFlagsMap }) &&
      (await this.recordAccessGroupService.isObjectUsingRecordAccessGroups({
        workspaceId,
        objectMetadataId,
      }))
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
      areRecordAccessGroupsEnabled({ featureFlagsMap }) &&
      (await this.recordAccessGroupService.isObjectReachedByRlsRuleRelation({
        workspaceId,
        objectMetadataId,
      }))
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
    return areRecordAccessGroupsEnabled({ featureFlagsMap })
      ? this.recordAccessGroupService.findRelatedRecords({
          workspaceId,
          objectMetadataId,
          recordIds,
          recordsBefore,
          transactionScope,
        })
      : [];
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
    if (!areRecordAccessGroupsEnabled({ featureFlagsMap })) {
      return [];
    }

    const isRecomputingInWrite =
      isRecomputingWrittenRecords &&
      writtenRecordIds.length <= MAX_RECORDS_RECOMPUTED_IN_WRITE;

    if (isRecomputingInWrite) {
      await this.recordAccessGroupService.recomputeRecordAccessGroupIdsOfRecords(
        {
          workspaceId,
          objectMetadataId,
          recordIds: writtenRecordIds,
          transactionScope,
        },
      );
    }

    const relatedRecords =
      relatedRecordsBeforeDelete ??
      (await this.recordAccessGroupService.findRelatedRecords({
        workspaceId,
        objectMetadataId,
        recordIds: writtenRecordIds,
        recordsBefore,
        updatedColumnNames,
        transactionScope,
      }));

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
    for (const { objectMetadataId, recordIds } of recordsToQueue) {
      if (
        await this.recordAccessGroupService.isObjectUsingRecordAccessGroups({
          workspaceId,
          objectMetadataId,
        })
      ) {
        await this.recordAccessGroupService.queueRecomputeRecordAccessGroupIdsOfRecords(
          { workspaceId, objectMetadataId, recordIds },
        );
      }
    }
  }
}
