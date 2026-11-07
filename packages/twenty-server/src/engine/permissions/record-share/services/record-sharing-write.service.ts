/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { PrivateRecordWriteService } from 'src/engine/permissions/internal/private-record/services/private-record-write.service';
import { RecordSharePrincipalService } from 'src/engine/permissions/internal/record-share/services/record-share-principal.service';
import { RecordShareStorageService } from 'src/engine/permissions/internal/record-share/services/record-share-storage.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RecordSharingChangeService } from 'src/engine/permissions/internal/record-share/services/record-sharing-change.service';
import { buildRecordShareInputsForCreatedRecords } from 'src/engine/permissions/internal/record-share/utils/build-record-share-inputs-for-created-records.util';
import { resolveRecordSharePrincipalOrThrow } from 'src/engine/permissions/internal/record-share/utils/resolve-record-share-principal-or-throw.util';
import { resolveShareWithPrincipalOrThrow } from 'src/engine/permissions/internal/record-share/utils/resolve-share-with-principal-or-throw.util';
import { validateShareWithArgOrThrow } from 'src/engine/permissions/internal/record-share/utils/validate-share-with-arg-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/permissions/internal/record-share/utils/validate-share-with-principals-or-throw.util';
import {
  type RecordSharePrincipalInput,
  type RecordSharingDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { type ShareWithInput } from 'src/engine/permissions/record-share/types/share-with-input.type';
import { type CreatedRecordSharing } from 'src/engine/permissions/record-share/utils/resolve-created-record-sharing-or-throw.util';
import { type ObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordSharingWriteService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly recordSharingChangeService: RecordSharingChangeService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly privateRecordWriteService: PrivateRecordWriteService,
  ) {}

  async setShare(
    args: RecordSharingArgs & {
      principal: RecordSharePrincipalInput;
      accessLevel: RecordShareAccessLevel;
    },
  ): Promise<RecordSharingDTO> {
    const maps = await this.workspaceCacheService.getOrRecompute(
      args.authContext.workspace.id,
      ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
    );
    const [principal] = validateShareWithPrincipalsOrThrow({
      shareWith: [{ ...args.principal, accessLevel: args.accessLevel }],
      ...maps,
    });

    return this.recordSharingChangeService.runChange({
      args,
      requiredCapability: 'isShareable',
      write: async ({ workspaceId, transactionScope, sharingObject }) => {
        await this.recordShareStorageService.setManualShare({
          workspaceId,
          transactionScope,
          enabled: true,
          share: {
            ...principal,
            objectMetadataId: args.objectMetadataId,
            recordId: args.recordId,
            sourceId: args.recordId,
          },
        });
        await this.recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow(
          {
            workspaceId,
            transactionScope,
            flatObjectMetadata: sharingObject.flatObjectMetadata,
            canShareBeyondRole: sharingObject.canShareBeyondRole,
            principals: [principal],
            recordIds: [args.recordId],
          },
        );
      },
    });
  }

  async removeShare(
    args: RecordSharingArgs & { principal: RecordSharePrincipalInput },
  ): Promise<RecordSharingDTO> {
    const principal = resolveRecordSharePrincipalOrThrow(args.principal);

    return this.recordSharingChangeService.runChange({
      args,
      requiredCapability: 'isShareable',
      write: ({ workspaceId, transactionScope }) =>
        this.recordShareStorageService.setManualShare({
          workspaceId,
          transactionScope,
          enabled: false,
          share: {
            ...principal,
            accessLevel: RecordShareAccessLevel.READ,
            objectMetadataId: args.objectMetadataId,
            recordId: args.recordId,
            sourceId: args.recordId,
          },
        }),
    });
  }

  setRecordPrivacy(
    args: RecordSharingArgs & { isPrivate: boolean },
  ): Promise<RecordSharingDTO> {
    return this.privateRecordWriteService.setRecordPrivacy(args);
  }

  async assertShareWithOrThrow({
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
    objectMetadataId,
    objectSharing,
    recordIds,
    createdRecordSharing: { shareWith, isPrivate },
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataId: string;
    objectSharing: ObjectSharing;
    recordIds: string[];
    createdRecordSharing: CreatedRecordSharing;
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;

    // A hard-destroyed record leaves its rows behind, and a client may reuse its id
    await this.recordShareStorageService.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds,
      transactionScope,
    });

    const { apiKeyRoleMap, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'apiKeyRoleMap',
        'flatObjectMetadataMaps',
      ]);
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    await this.recordShareStorageService.insertMany({
      workspaceId,
      recordShares: buildRecordShareInputsForCreatedRecords({
        recordIds,
        objectMetadataId,
        authContext,
        apiKeyRoleMap,
        shareWith,
        isPrivateByDefault: objectSharing.isPrivateByDefault,
        isPrivate,
      }),
      transactionScope,
    });

    if (isPrivate) {
      await this.privateRecordWriteService.setPrivateOrThrow({
        workspaceId,
        objectMetadataId,
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
