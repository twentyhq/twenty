/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordShareRowCause } from 'twenty-shared/types';
import { type EntityManager } from 'typeorm';

import { RECORD_SHARE_OBJECT_METADATA_NAME } from 'src/engine/permissions/record-permission-orm/constants/record-share-object-metadata-name.constant';
import { RecordPermissionOrmService } from 'src/engine/permissions/record-permission-orm/services/record-permission-orm.service';
import { type RecordShareCriteria } from 'src/engine/permissions/record-permission-orm/types/record-share-criteria.type';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class RecordShareStorageService {
  constructor(
    private readonly recordPermissionOrmService: RecordPermissionOrmService,
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
    await this.recordPermissionOrmService.deleteRecordShares({
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
      await this.recordPermissionOrmService.insertRecordShares({
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
    return this.recordPermissionOrmService.insertRecordShares({
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

    await this.recordPermissionOrmService.deleteRecordShares({
      workspaceId,
      transactionScope,
      criteria: { objectMetadataId, recordIds },
    });
  }

  async deleteByRecordIdsInTransaction({
    workspaceId,
    objectMetadataId,
    recordIds,
    manager,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
    manager: EntityManager;
  }): Promise<void> {
    if (recordIds.length === 0) {
      return;
    }
    // History transactions span core and workspace tables, so they must reuse their connection.
    await manager.query(
      `DELETE FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(RECORD_SHARE_OBJECT_METADATA_NAME)} WHERE "objectMetadataId" = $1 AND "recordId" = ANY($2::uuid[])`,
      [objectMetadataId, recordIds],
    );
  }

  async deleteMatching({
    workspaceId,
    criteria,
    transactionScope,
  }: {
    workspaceId: string;
    criteria: RecordShareCriteria[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    for (const criterion of criteria) {
      await this.recordPermissionOrmService.deleteRecordShares({
        workspaceId,
        transactionScope,
        criteria: criterion,
      });
    }
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
    return this.recordPermissionOrmService.deleteRecordShares({
      workspaceId,
      transactionScope,
      criteria: { sourceId },
    });
  }

  transferMemberGrants(args: {
    workspaceId: string;
    objectMetadataIds: string[];
    fromWorkspaceMemberId: string;
    toWorkspaceMemberId: string | undefined;
  }): Promise<void> {
    return this.recordPermissionOrmService.transferMemberRecordShares(args);
  }

  insertOwnerGrantsFromSelect(args: {
    workspaceId: string;
    recordSelect: string;
    parameters: Record<string, unknown>;
    granteeWorkspaceMemberId: string;
  }): Promise<void> {
    return this.recordPermissionOrmService.insertOwnerRecordSharesFromSelect(
      args,
    );
  }
}
