/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { hasCreatedByField } from 'src/engine/permissions/internal/record-permission-repository/utils/has-created-by-field.util';
import { type RecordSharingChange } from 'src/engine/permissions/record-share/types/record-sharing-change.type';
import { PrivateRecordSystemWriteService } from 'src/engine/permissions/private-record/services/private-record-system-write.service';
import { RecordSharePrincipalService } from 'src/engine/permissions/record-share/services/record-share-principal.service';
import { RecordShareStorageService } from 'src/engine/permissions/internal/record-share/services/record-share-storage.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RecordSharingChangeService } from 'src/engine/permissions/record-share/services/record-sharing-change.service';
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
import { isRecordSharingEnabled } from 'src/engine/permissions/record-share/utils/is-record-sharing-enabled.util';
import { canSetRecordPrivacy } from 'src/engine/permissions/private-record/utils/can-set-record-privacy.util';
import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ApplicationGrantRoleLookupService } from 'src/engine/core-modules/application/application-grant-role-lookup/services/application-grant-role-lookup.service';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';

@Injectable()
export class RecordSharingWriteService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly recordSharingChangeService: RecordSharingChangeService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly privateRecordSystemWriteService: PrivateRecordSystemWriteService,
    private readonly applicationGrantRoleLookupService: ApplicationGrantRoleLookupService,
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
      isChangeEnabled: isRecordSharingEnabled,
      write: async ({
        workspaceId,
        transactionScope,
        flatObjectMetadata,
        featureFlagsMap,
      }) => {
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
        await this.recordSharePrincipalService.assertShareRecipientsCanReadRecordsOrThrow(
          {
            workspaceId,
            transactionScope,
            flatObjectMetadata,
            featureFlagsMap,
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
      isChangeEnabled: isRecordSharingEnabled,
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
    return this.recordSharingChangeService.runChange({
      args,
      write: (change) => this.writeRecordPrivacy({ ...change, args }),
      isChangeEnabled: canSetRecordPrivacy,
    });
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
    recordIds,
    createdRecordSharing: { shareWith, isPrivate },
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataId: string;
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

    const { apiKeyRoleMap, flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'apiKeyRoleMap',
        'flatObjectMetadataMaps',
        'featureFlagsMap',
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
        applicationRoleId: isApplicationAuthContext(authContext)
          ? await this.applicationGrantRoleLookupService.findGrantRoleId({
              workspaceId,
              flatApplication: authContext.application,
            })
          : undefined,
        shareWith,
        isPrivateByDefault: isPrivateByDefaultObject(flatObjectMetadata),
        isPrivate,
      }),
      transactionScope,
    });

    if (isPrivate) {
      await this.privateRecordSystemWriteService.setRecordsPrivacy({
        workspaceId,
        objectMetadataId,
        recordIds,
        isPrivate: true,
        transactionScope,
      });
    }

    await this.recordSharePrincipalService.assertShareRecipientsCanReadRecordsOrThrow(
      {
        workspaceId,
        transactionScope,
        flatObjectMetadata,
        featureFlagsMap,
        principals: shareWith.map(resolveShareWithPrincipalOrThrow),
        recordIds,
      },
    );
  }

  private async writeRecordPrivacy({
    workspaceId,
    transactionScope,
    flatObjectMetadata,
    featureFlagsMap,
    creatorWorkspaceMemberId,
    args,
  }: RecordSharingChange & {
    args: RecordSharingArgs & { isPrivate: boolean };
  }): Promise<void> {
    const { isPrivate } = args;

    if (
      isPrivate &&
      !isRecordSharingEnabled({ featureFlagsMap }) &&
      args.authContext.workspaceMemberId !== creatorWorkspaceMemberId
    ) {
      throw new NotFoundError('Record not found', {
        userFriendlyMessage: msg`Record not found`,
      });
    }

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    await this.privateRecordSystemWriteService.setRecordsPrivacy({
      workspaceId,
      objectMetadataId: flatObjectMetadata.id,
      recordIds: [args.recordId],
      isPrivate,
      transactionScope,
    });

    if (!isPrivate) {
      if (!hasCreatedByField({ flatObjectMetadata, flatFieldMetadataMaps })) {
        return;
      }

      await this.recordShareStorageService.deleteMatching({
        workspaceId,
        transactionScope,
        criteria: {
          objectMetadataId: args.objectMetadataId,
          recordIds: [args.recordId],
          rowCause: RecordShareRowCause.OWNER,
        },
      });

      return;
    }

    await this.recordShareStorageService.deleteMatching({
      workspaceId,
      transactionScope,
      criteria: {
        objectMetadataId: args.objectMetadataId,
        recordIds: [args.recordId],
        principalType: RecordSharePrincipalType.EVERYONE,
        rowCause: RecordShareRowCause.MANUAL,
      },
    });

    if (args.authContext.workspaceMemberId === creatorWorkspaceMemberId) {
      return;
    }

    await this.recordShareStorageService.insertMany({
      workspaceId,
      transactionScope,
      recordShares: [
        {
          recordId: args.recordId,
          objectMetadataId: args.objectMetadataId,
          principalId: args.authContext.workspaceMemberId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: args.recordId,
        },
      ],
    });
  }
}
