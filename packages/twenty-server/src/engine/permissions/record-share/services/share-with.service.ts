/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordSharePrincipalService } from 'src/engine/permissions/record-share/services/record-share-principal.service';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type ShareWithInput } from 'src/engine/permissions/record-share/types/share-with-input.type';
import { buildRecordShareInputsForCreatedRecords } from 'src/engine/permissions/record-share/utils/build-record-share-inputs-for-created-records.util';
import { type CreatedRecordSharing } from 'src/engine/permissions/record-share/utils/resolve-created-record-sharing-or-throw.util';
import { type ObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';
import { resolveShareWithPrincipalOrThrow } from 'src/engine/permissions/record-share/utils/resolve-share-with-principal-or-throw.util';
import { validateShareWithArgOrThrow } from 'src/engine/permissions/record-share/utils/validate-share-with-arg-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/permissions/record-share/utils/validate-share-with-principals-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ShareWithService {
  constructor(
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async validateShareWithOrThrow({
    authContext,
    shareWith,
  }: {
    authContext: WorkspaceAuthContext;
    shareWith?: ShareWithInput[] | null;
  }): Promise<void> {
    validateShareWithArgOrThrow({
      authContext,
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
    flatObjectMetadata,
    objectSharing,
    recordIds,
    apiKeyRoleMap,
    createdRecordSharing: { shareWith, isPrivate },
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    flatObjectMetadata: FlatObjectMetadata;
    objectSharing: ObjectSharing;
    recordIds: string[];
    apiKeyRoleMap: Record<string, string>;
    createdRecordSharing: CreatedRecordSharing;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;

    // A hard-destroyed record leaves its rows behind, and a client may reuse its id
    await this.recordShareStorageService.deleteByRecordIds({
      workspaceId,
      objectMetadataId: flatObjectMetadata.id,
      recordIds,
      transactionScope,
    });

    await this.recordShareStorageService.insertMany({
      workspaceId,
      recordShares: buildRecordShareInputsForCreatedRecords({
        recordIds,
        objectMetadataId: flatObjectMetadata.id,
        authContext,
        apiKeyRoleMap,
        shareWith,
        isShareRequired: objectSharing.isShareRequired,
        isPrivate,
      }),
      transactionScope,
    });

    if (isPrivate) {
      await this.privateRecordStorageService.setPrivate({
        workspaceId,
        flatObjectMetadata,
        recordIds,
        isPrivate: true,
        transactionScope,
      });
    }

    await this.recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow({
      workspaceId,
      transactionScope,
      flatObjectMetadata,
      canShareBeyondRole: objectSharing.canShareBeyondRole,
      principals: shareWith.map(resolveShareWithPrincipalOrThrow),
      recordIds,
    });
  }
}
