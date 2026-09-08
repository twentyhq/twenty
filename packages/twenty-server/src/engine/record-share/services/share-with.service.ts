import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type ShareWithInput } from 'src/engine/record-share/types/share-with-input.type';
import { buildRecordShareInputsForCreatedRecords } from 'src/engine/record-share/utils/build-record-share-inputs-for-created-records.util';
import { validateShareWithArgOrThrow } from 'src/engine/record-share/utils/validate-share-with-arg-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/record-share/utils/validate-share-with-principals-or-throw.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ShareWithService {
  constructor(
    private readonly recordShareService: RecordShareService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async validateShareWithOrThrow({
    authContext,
    isRecordSharingEnabled,
    shareWith,
  }: {
    authContext: WorkspaceAuthContext;
    isRecordSharingEnabled: boolean;
    shareWith?: ShareWithInput[] | null;
  }): Promise<void> {
    validateShareWithArgOrThrow({
      authContext,
      isRecordSharingEnabled,
      shareWith,
    });

    if (!isNonEmptyArray(shareWith)) {
      return;
    }

    const { flatWorkspaceMemberMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
      );

    validateShareWithPrincipalsOrThrow({
      shareWith,
      flatWorkspaceMemberMaps,
      flatRoleMaps,
    });
  }

  async insertRecordSharesForCreatedRecords({
    authContext,
    objectMetadataId,
    recordIds,
    apiKeyRoleMap,
    isRecordSharingEnabled,
    shareWith,
    ownerWorkspaceMemberIdByRecordId,
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataId: string;
    recordIds: string[];
    apiKeyRoleMap: Record<string, string>;
    isRecordSharingEnabled: boolean;
    shareWith?: ShareWithInput[] | null;
    ownerWorkspaceMemberIdByRecordId?: Record<
      string,
      string | null | undefined
    >;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;

    // A hard-destroyed record leaves its rows behind, and a client may reuse its id
    await this.recordShareService.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds,
      transactionScope,
    });

    await this.recordShareService.insertMany({
      workspaceId,
      recordShares: buildRecordShareInputsForCreatedRecords({
        recordIds,
        objectMetadataId,
        authContext,
        apiKeyRoleMap,
        isRecordSharingEnabled,
        shareWith,
        ownerWorkspaceMemberIdByRecordId,
      }),
      transactionScope,
    });
  }
}
