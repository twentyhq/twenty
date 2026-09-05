import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { resolveShareWithPrincipal } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/resolve-share-with-principal.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { getEffectiveReadability } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-readability.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type RecordSharesDTO } from 'src/engine/record-share/dtos/record-share.dto';
import { type ShareWithInput } from 'src/engine/record-share/dtos/share-with.input';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';
import { findOwnerField } from 'src/engine/record-share/utils/find-owner-field.util';
import { resolvePrincipalIdsFromAuthContext } from 'src/engine/twenty-orm/utils/resolve-principal-ids-from-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const ACCESS_LEVEL_RANK: Record<RecordShareAccessLevel, number> = {
  [RecordShareAccessLevel.READ]: 1,
  [RecordShareAccessLevel.READ_WRITE]: 2,
  [RecordShareAccessLevel.FULL]: 3,
};

type RecordShareTarget = {
  authContext: UserWorkspaceAuthContext;
  objectMetadataId: string;
  recordId: string;
};

type ShareWithPrincipal = Pick<
  RecordShareInput,
  'principalId' | 'principalType' | 'accessLevel'
>;

@Injectable()
export class ManualRecordShareService {
  constructor(
    private readonly recordShareService: RecordShareService,
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async findRecordShares(target: RecordShareTarget): Promise<RecordSharesDTO> {
    await this.findFlatObjectMetadataOrThrow(target);

    return this.listRecordSharesOrThrow(
      target,
      Object.values(RecordShareAccessLevel),
    );
  }

  async shareRecord({
    shareWith,
    ...target
  }: RecordShareTarget & {
    shareWith: ShareWithInput[];
  }): Promise<RecordSharesDTO> {
    await this.findPrivateFlatObjectMetadataOrThrow(target);
    await this.listRecordSharesOrThrow(target, [RecordShareAccessLevel.FULL]);

    const { authContext, objectMetadataId, recordId } = target;
    const workspaceId = authContext.workspace.id;
    const principals = await this.resolveShareWithPrincipals({
      workspaceId,
      shareWith,
    });

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            for (const principal of principals) {
              await this.recordShareService.deleteManualRowsForPrincipal({
                workspaceId,
                objectMetadataId,
                recordId,
                principalId: principal.principalId,
                sourceId: authContext.workspaceMemberId,
                transactionScope,
              });
            }

            await this.recordShareService.insertMany({
              workspaceId,
              recordShares: principals.map((principal) => ({
                recordId,
                objectMetadataId,
                ...principal,
                rowCause: RecordShareRowCause.MANUAL,
                sourceId: authContext.workspaceMemberId,
              })),
              transactionScope,
            });
          },
        ),
      authContext,
    );

    return this.listRecordShares(target);
  }

  async unshareRecord({
    principalId,
    ...target
  }: RecordShareTarget & { principalId: string }): Promise<RecordSharesDTO> {
    await this.findPrivateFlatObjectMetadataOrThrow(target);
    await this.listRecordSharesOrThrow(target, [RecordShareAccessLevel.FULL]);

    await this.recordShareService.deleteManualRowsForPrincipal({
      workspaceId: target.authContext.workspace.id,
      objectMetadataId: target.objectMetadataId,
      recordId: target.recordId,
      principalId,
    });

    return this.listRecordShares(target);
  }

  async transferRecordOwnership({
    workspaceMemberId,
    ...target
  }: RecordShareTarget & {
    workspaceMemberId: string;
  }): Promise<RecordSharesDTO> {
    const flatObjectMetadata =
      await this.findPrivateFlatObjectMetadataOrThrow(target);

    await this.listRecordSharesOrThrow(target, [RecordShareAccessLevel.FULL]);

    const { authContext, objectMetadataId, recordId } = target;
    const workspaceId = authContext.workspace.id;
    const { flatFieldMetadataMapsOrm, flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMapsOrm',
        'flatWorkspaceMemberMaps',
      ]);

    const ownerField = findOwnerField({
      flatObjectMetadata,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
    });

    if (!isDefined(ownerField)) {
      throw new PermissionsException(
        `Object "${flatObjectMetadata.nameSingular}" has no owner field`,
        PermissionsExceptionCode.INVALID_ARG,
        { userFriendlyMessage: msg`This object has no owner field.` },
      );
    }

    if (!isDefined(flatWorkspaceMemberMaps.byId[workspaceMemberId])) {
      throw new PermissionsException(
        `Workspace member ${workspaceMemberId} not found`,
        PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    const { objectsPermissions } =
      await this.permissionsService.getUserWorkspacePermissions({
        userWorkspaceId: authContext.userWorkspaceId,
        workspaceId,
      });

    if (!objectsPermissions[objectMetadataId]?.canUpdateObjectRecords) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const { affected } = await transactionScope
              .getRepository(flatObjectMetadata.nameSingular, {
                shouldBypassPermissionChecks: true,
              })
              .update(recordId, {
                [ownerField.joinColumnName]: workspaceMemberId,
              });

            if (affected !== 1) {
              throw new PermissionsException(
                `Record ${recordId} not found`,
                PermissionsExceptionCode.RECORD_NOT_FOUND,
              );
            }

            await this.recordShareService.replaceOwnerRows({
              workspaceId,
              objectMetadataId,
              ownerWorkspaceMemberIdByRecordId: {
                [recordId]: workspaceMemberId,
              },
              transactionScope,
            });
          },
        ),
      authContext,
    );

    return this.listRecordShares(target);
  }

  private async resolveShareWithPrincipals({
    workspaceId,
    shareWith,
  }: {
    workspaceId: string;
    shareWith: ShareWithInput[];
  }): Promise<ShareWithPrincipal[]> {
    const { flatWorkspaceMemberMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'flatRoleMaps',
      ]);

    return shareWith.map((shareWithEntry) => {
      const principal = this.resolveShareWithPrincipal(shareWithEntry);

      switch (principal.principalType) {
        case RecordSharePrincipalType.WORKSPACE_MEMBER:
          if (!isDefined(flatWorkspaceMemberMaps.byId[principal.principalId])) {
            throw new PermissionsException(
              `Workspace member ${principal.principalId} not found`,
              PermissionsExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
            );
          }
          break;
        case RecordSharePrincipalType.ROLE:
          if (
            !isDefined(
              flatRoleMaps.universalIdentifierById[principal.principalId],
            )
          ) {
            throw new PermissionsException(
              PermissionsExceptionMessage.ROLE_NOT_FOUND,
              PermissionsExceptionCode.ROLE_NOT_FOUND,
            );
          }
          break;
        case RecordSharePrincipalType.EVERYONE:
          break;
      }

      return principal;
    });
  }

  private resolveShareWithPrincipal(
    shareWithEntry: ShareWithInput,
  ): ShareWithPrincipal {
    if (
      shareWithEntry.workspaceMemberId === EVERYONE_PRINCIPAL_ID ||
      shareWithEntry.roleId === EVERYONE_PRINCIPAL_ID
    ) {
      throw new PermissionsException(
        'The everyone principal must be targeted with the everyone flag',
        PermissionsExceptionCode.INVALID_ARG,
        {
          userFriendlyMessage: msg`The everyone principal must be targeted with the everyone flag`,
        },
      );
    }

    try {
      return resolveShareWithPrincipal(shareWithEntry);
    } catch (error) {
      if (error instanceof CommonQueryRunnerException) {
        throw new PermissionsException(
          error.message,
          PermissionsExceptionCode.INVALID_ARG,
          { userFriendlyMessage: error.userFriendlyMessage },
        );
      }

      throw error;
    }
  }

  private async findFlatObjectMetadataOrThrow({
    authContext,
    objectMetadataId,
  }: RecordShareTarget): Promise<FlatObjectMetadata> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatObjectMetadataMaps'],
      );

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return flatObjectMetadata;
  }

  private async findPrivateFlatObjectMetadataOrThrow(
    target: RecordShareTarget,
  ): Promise<FlatObjectMetadata> {
    const flatObjectMetadata = await this.findFlatObjectMetadataOrThrow(target);

    if (
      getEffectiveReadability(flatObjectMetadata) !==
      MetadataReadability.PRIVATE
    ) {
      throw new PermissionsException(
        `Object "${flatObjectMetadata.nameSingular}" is not private`,
        PermissionsExceptionCode.INVALID_ARG,
        {
          userFriendlyMessage: msg`Only records of private objects can be shared.`,
        },
      );
    }

    return flatObjectMetadata;
  }

  private async listRecordSharesOrThrow(
    target: RecordShareTarget,
    requiredAccessLevels: RecordShareAccessLevel[],
  ): Promise<RecordSharesDTO> {
    const recordShares = await this.listRecordShares(target);

    if (
      !isDefined(recordShares.viewerAccessLevel) ||
      !requiredAccessLevels.includes(recordShares.viewerAccessLevel)
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return recordShares;
  }

  private async listRecordShares({
    authContext,
    objectMetadataId,
    recordId,
  }: RecordShareTarget): Promise<RecordSharesDTO> {
    const workspaceId = authContext.workspace.id;
    const { userWorkspaceRoleMap, apiKeyRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
        'apiKeyRoleMap',
      ]);
    const principalIds =
      resolvePrincipalIdsFromAuthContext({
        authContext,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
      }) ?? [];

    const recordShares = await this.recordShareService.findByRecord({
      workspaceId,
      objectMetadataId,
      recordId,
    });

    const viewerAccessLevel = recordShares
      .filter((recordShare) => principalIds.includes(recordShare.principalId))
      .reduce<RecordShareAccessLevel | null>(
        (highestAccessLevel, recordShare) =>
          !isDefined(highestAccessLevel) ||
          ACCESS_LEVEL_RANK[recordShare.accessLevel] >
            ACCESS_LEVEL_RANK[highestAccessLevel]
            ? recordShare.accessLevel
            : highestAccessLevel,
        null,
      );

    return { shares: recordShares, viewerAccessLevel };
  }
}
