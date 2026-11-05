/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordShareRowCause } from 'twenty-shared/types';

import { RecordShareWriteOrmService } from 'src/engine/permissions/record-permission-orm/services/record-share-write-orm.service';
import { type RecordShareCriteria } from 'src/engine/permissions/record-permission-orm/types/record-share-criteria.type';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

@Injectable()
export class RecordShareStorageService {
  constructor(
    private readonly recordShareWriteOrmService: RecordShareWriteOrmService,
  ) {}

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
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    await this.recordShareWriteOrmService.deleteRecordShares({
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
      await this.recordShareWriteOrmService.insertRecordShares({
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
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    return this.recordShareWriteOrmService.insertRecordShares({
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
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    if (recordIds.length === 0) {
      return;
    }

    await this.recordShareWriteOrmService.deleteRecordShares({
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
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    return this.recordShareWriteOrmService.deleteRecordShares({
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
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    return this.recordShareWriteOrmService.deleteRecordShares({
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
    return this.recordShareWriteOrmService.transferMemberRecordShares({
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
    return this.recordShareWriteOrmService.insertOwnerRecordSharesFromSelect({
      workspaceId,
      recordSelect,
      parameters,
      granteeWorkspaceMemberId,
    });
  }
}
