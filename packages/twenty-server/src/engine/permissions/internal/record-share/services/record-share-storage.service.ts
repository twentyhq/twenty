/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordShareRowCause } from 'twenty-shared/types';

import { RecordShareRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-share.repository';
import { type RecordShareCriteria } from 'src/engine/permissions/internal/record-permission-repository/types/record-share-criteria.type';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';

@Injectable()
export class RecordShareStorageService {
  constructor(private readonly recordShareRepository: RecordShareRepository) {}

  // Must share the caller's transaction; OWNER and APPLICATION grants are managed by their producers.
  async setManualShare({
    workspaceId,
    share,
    enabled,
    transactionScope,
  }: {
    workspaceId: string;
    share: Omit<RecordShareInput, 'rowCause'>;
    enabled: boolean;
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    await this.recordShareRepository.deleteRecordShares({
      workspaceId,
      transactionScope,
      criteria: {
        objectMetadataId: share.objectMetadataId,
        recordIds: [share.recordId],
        principalId: share.principalId,
        principalType: share.principalType,
        rowCause: RecordShareRowCause.MANUAL,
      },
    });

    if (enabled) {
      await this.recordShareRepository.insertRecordShares({
        workspaceId,
        transactionScope,
        recordShares: [{ ...share, rowCause: RecordShareRowCause.MANUAL }],
        shouldIgnoreConflicts: false,
      });
    }
  }

  insertMany({
    workspaceId,
    recordShares,
    transactionScope,
  }: {
    workspaceId: string;
    recordShares: RecordShareInput[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<void> {
    return this.recordShareRepository.insertRecordShares({
      workspaceId,
      recordShares,
      shouldIgnoreConflicts: true,
      transactionScope,
    });
  }

  async deleteByRecordIds({
    workspaceId,
    objectMetadataId,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<void> {
    if (recordIds.length === 0) {
      return;
    }

    await this.recordShareRepository.deleteRecordShares({
      workspaceId,
      transactionScope,
      criteria: { objectMetadataId, recordIds },
    });
  }

  deleteMatching({
    workspaceId,
    criteria,
    transactionScope,
  }: {
    workspaceId: string;
    criteria: RecordShareCriteria;
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<void> {
    return this.recordShareRepository.deleteRecordShares({
      workspaceId,
      transactionScope,
      criteria,
    });
  }

  deleteBySourceId({
    workspaceId,
    sourceId,
    transactionScope,
  }: {
    workspaceId: string;
    sourceId: string;
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<void> {
    return this.recordShareRepository.deleteRecordShares({
      workspaceId,
      transactionScope,
      criteria: { sourceId },
    });
  }

  transferMemberGrants({
    workspaceId,
    objectMetadataIds,
    fromWorkspaceMemberId,
    toWorkspaceMemberId,
  }: {
    workspaceId: string;
    objectMetadataIds: string[];
    fromWorkspaceMemberId: string;
    toWorkspaceMemberId: string | undefined;
  }): Promise<void> {
    return this.recordShareRepository.transferMemberRecordShares({
      workspaceId,
      objectMetadataIds,
      fromWorkspaceMemberId,
      toWorkspaceMemberId,
    });
  }

  insertOwnerGrantsFromSelect({
    workspaceId,
    recordSelect,
    parameters,
    granteeWorkspaceMemberId,
  }: {
    workspaceId: string;
    recordSelect: string;
    parameters: Record<string, unknown>;
    granteeWorkspaceMemberId: string;
  }): Promise<void> {
    return this.recordShareRepository.insertOwnerRecordSharesFromSelect({
      workspaceId,
      recordSelect,
      parameters,
      granteeWorkspaceMemberId,
    });
  }
}
