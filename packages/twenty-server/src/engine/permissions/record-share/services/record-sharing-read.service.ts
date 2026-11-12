/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  type FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';
import { RecordPermissionReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-permission-read.repository';
import { PrivateRecordRepository } from 'src/engine/permissions/internal/private-record/repositories/private-record.repository';
import { DENIED_RECORD_PERMISSIONS } from 'src/engine/permissions/record-permissions/constants/denied-record-permissions.constant';
import { type RecordPermissionsDTO } from 'src/engine/permissions/record-permissions/dtos/record-permissions.dto';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import {
  type RecordSharingDTO,
  type RecordSharingGrantDTO,
  type RecordSharingRoleDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { isRecordSharingEnabled } from 'src/engine/permissions/record-share/utils/is-record-sharing-enabled.util';
import { canSetRecordPrivacy } from 'src/engine/permissions/private-record/utils/can-set-record-privacy.util';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { resolveRecordSharePrincipalRoleIds } from 'src/engine/permissions/internal/record-share/utils/resolve-record-share-principal-role-ids.util';
import { findRecordSharingFlatObjectMetadataOrThrow } from 'src/engine/permissions/internal/record-share/utils/find-record-sharing-flat-object-metadata-or-throw.util';
import { resolveViewerRecordShareAccessLevel } from 'src/engine/permissions/internal/record-share/utils/resolve-viewer-record-share-access-level.util';
import { canRolesAccessAllRecords } from 'src/engine/permissions/internal/role/utils/can-roles-access-all-records.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type ViewerRecordAccess = {
  viewerAccessLevel: RecordShareAccessLevel | null;
  creatorWorkspaceMemberId: string | undefined;
};

@Injectable()
export class RecordSharingReadService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordPermissionReadRepository: RecordPermissionReadRepository,
    private readonly privateRecordRepository: PrivateRecordRepository,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
  ) {}

  async findRecordSharingPanel(
    args: RecordSharingArgs,
  ): Promise<RecordSharingDTO> {
    const { flatObjectMetadata, featureFlagsMap } =
      await this.findFlatObjectMetadataAndFeatureFlagsMapOrThrow(args);
    const permissions = await this.findPermissions({
      args,
      flatObjectMetadata,
    });

    if (!permissions.canRead) {
      throw new NotFoundError('Record not found');
    }

    return this.buildSharingResponse({
      args,
      flatObjectMetadata,
      featureFlagsMap,
      permissions,
    });
  }

  async findRecordSharingAfterChange(
    args: RecordSharingArgs,
  ): Promise<RecordSharingDTO> {
    const { flatObjectMetadata, featureFlagsMap } =
      await this.findFlatObjectMetadataAndFeatureFlagsMapOrThrow(args);
    const permissions = await this.findPermissions({
      args,
      flatObjectMetadata,
    });

    if (!permissions.canRead) {
      return {
        isShareable: isRecordSharingEnabled({ featureFlagsMap }),
        isPrivate: false,
        canManageSharing: false,
        permissions,
        hasManagedGeneralAccess: false,
        roles: [],
        shares: [],
      };
    }

    return this.buildSharingResponse({
      args,
      flatObjectMetadata,
      featureFlagsMap,
      permissions,
    });
  }

  async canManageRecordSharing(args: RecordSharingArgs): Promise<boolean> {
    const { flatObjectMetadata, featureFlagsMap } =
      await this.findFlatObjectMetadataAndFeatureFlagsMapOrThrow(args);
    const permissions = await this.findPermissions({
      args,
      flatObjectMetadata,
    });

    if (!permissions.canRead) {
      throw new NotFoundError('Record not found');
    }

    const { viewerAccessLevel } = await this.findRecordShareState({
      ...args,
      flatObjectMetadata,
      featureFlagsMap,
    });

    return this.resolveCanManageSharing({
      args,
      flatObjectMetadata,
      featureFlagsMap,
      permissions,
      viewerAccessLevel,
    });
  }

  async findViewerRecordAccess(
    args: RecordSharingArgs & {
      transactionScope: RecordPermissionTransactionScope;
    },
  ): Promise<ViewerRecordAccess> {
    const { viewerAccessLevel, creatorWorkspaceMemberId } =
      await this.findRecordShareState({
        ...args,
        ...(await this.findFlatObjectMetadataAndFeatureFlagsMapOrThrow(args)),
      });

    return { viewerAccessLevel, creatorWorkspaceMemberId };
  }

  private async buildSharingResponse({
    args,
    flatObjectMetadata,
    featureFlagsMap,
    permissions,
  }: {
    args: RecordSharingArgs;
    flatObjectMetadata: FlatObjectMetadata;
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
    permissions: RecordPermissionsDTO;
  }): Promise<RecordSharingDTO> {
    const { shares, viewerAccessLevel, isPrivate } =
      await this.findRecordShareState({
        ...args,
        flatObjectMetadata,
        featureFlagsMap,
      });
    const canManageSharing = await this.resolveCanManageSharing({
      args,
      flatObjectMetadata,
      featureFlagsMap,
      permissions,
      viewerAccessLevel,
    });
    const grants = shares.filter(
      (share) =>
        share.principalType !== RecordSharePrincipalType.EVERYONE &&
        share.accessLevel !== RecordShareAccessLevel.NONE,
    );

    return {
      isShareable: isRecordSharingEnabled({ featureFlagsMap }),
      isPrivate,
      canManageSharing,
      permissions,
      hasManagedGeneralAccess: shares.some(
        (share) =>
          share.principalType === RecordSharePrincipalType.EVERYONE &&
          share.rowCause !== RecordShareRowCause.MANUAL &&
          share.accessLevel !== RecordShareAccessLevel.NONE,
      ),
      shares: canManageSharing
        ? await this.buildGrants({
            workspaceId: args.authContext.workspace.id,
            grants,
          })
        : [],
      roles: canManageSharing
        ? await this.buildRoles({
            workspaceId: args.authContext.workspace.id,
            objectMetadataId: flatObjectMetadata.id,
            grants,
          })
        : [],
    };
  }

  private async resolveCanManageSharing({
    args,
    flatObjectMetadata,
    featureFlagsMap,
    permissions,
    viewerAccessLevel,
  }: {
    args: Pick<RecordSharingArgs, 'authContext'>;
    flatObjectMetadata: FlatObjectMetadata;
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
    permissions: Pick<RecordPermissionsDTO, 'canUpdate'>;
    viewerAccessLevel: RecordShareAccessLevel | null;
  }): Promise<boolean> {
    return (
      isRecordSharingEnabled({ featureFlagsMap }) &&
      permissions.canUpdate &&
      viewerAccessLevel === RecordShareAccessLevel.FULL &&
      (await this.recordPermissionsReadService.canAllRecordsOrRowLevelPermissionsGrantOperation(
        {
          principals:
            await this.principalPermissionsReadService.resolvePermissionsPrincipals(
              {
                authContext: args.authContext,
              },
            ),
          objectMetadataId: flatObjectMetadata.id,
          operationType: 'update',
        },
      ))
    );
  }

  private async buildGrants({
    workspaceId,
    grants,
  }: {
    workspaceId: string;
    grants: RecordShare[];
  }): Promise<RecordSharingGrantDTO[]> {
    const { flatWorkspaceMemberMaps, userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'userWorkspaceRoleMap',
      ]);
    const roleIds = resolveRecordSharePrincipalRoleIds({
      principals: grants,
      flatWorkspaceMemberMaps,
      userWorkspaceRoleMap,
    });

    return grants.map((grant, index) => ({
      id: grant.id,
      principalType: grant.principalType,
      principalId: grant.principalId,
      principalRoleId:
        grant.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER
          ? (roleIds[index] ?? null)
          : null,
      accessLevel: grant.accessLevel,
      rowCause: grant.rowCause,
    }));
  }

  private async buildRoles({
    workspaceId,
    objectMetadataId,
    grants,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    grants: RecordShare[];
  }): Promise<RecordSharingRoleDTO[]> {
    const { flatRoleMaps, rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleMaps',
        'rolesPermissions',
      ]);

    return Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (role) =>
          role.canBeAssignedToUsers ||
          grants.some(
            (grant) =>
              grant.principalType === RecordSharePrincipalType.ROLE &&
              grant.principalId === role.id,
          ),
      )
      .map(({ id, label }) => {
        const roleRecordsPermissions = rolesPermissions[id];

        if (!isDefined(roleRecordsPermissions)) {
          return { id, label, canRead: null, canUpdate: null };
        }

        const objectRecordsPermissions =
          roleRecordsPermissions.objects[objectMetadataId];

        return {
          id,
          label,
          canRead: canReachSomeRecords({
            objectRecordsPermissions,
            operationType: 'read',
          }),
          canUpdate: canReachSomeRecords({
            objectRecordsPermissions,
            operationType: 'update',
          }),
        };
      });
  }

  private async findRecordShareState({
    authContext,
    objectMetadataId,
    recordId,
    flatObjectMetadata,
    featureFlagsMap,
    transactionScope,
  }: RecordSharingArgs & {
    flatObjectMetadata: FlatObjectMetadata;
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
    transactionScope?: RecordPermissionTransactionScope;
  }) {
    const workspaceId = authContext.workspace.id;
    const { roleIdsWithAllRecordsAccess } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'roleIdsWithAllRecordsAccess',
      ]);
    const principals =
      await this.principalPermissionsReadService.resolvePermissionsPrincipals({
        authContext,
      });
    const canAccessAllRecords =
      isDefined(principals) &&
      canRolesAccessAllRecords({
        roleIds: getPermissionsPrincipalsRoleIds(principals),
        roleIdsWithAllRecordsAccess,
      });
    const shares = await this.recordPermissionReadRepository.findRecordShares({
      workspaceId,
      objectMetadataId,
      recordIds: [recordId],
      transactionScope,
    });
    const privateRecordState = await this.findPrivateRecordState({
      workspaceId,
      flatObjectMetadata,
      recordId,
      transactionScope,
    });

    const isPrivate = privateRecordState?.isPrivate ?? false;
    const creatorWorkspaceMemberId =
      privateRecordState?.createdByWorkspaceMemberId ?? undefined;
    const viewerAccessLevel = resolveViewerRecordShareAccessLevel({
      recordShares: shares,
      principalIds: [
        EVERYONE_PRINCIPAL_ID,
        ...(isDefined(principals)
          ? getPermissionsPrincipalsShareKeys(principals)
          : []),
      ],
      implicitAccessLevels:
        isRecordSharingEnabled({ featureFlagsMap }) ||
        canSetRecordPrivacy({ featureFlagsMap })
          ? [
              isPrivate ? null : RecordShareAccessLevel.READ_WRITE,
              creatorWorkspaceMemberId === authContext.workspaceMemberId ||
              (canAccessAllRecords && !isPrivate)
                ? RecordShareAccessLevel.FULL
                : null,
            ]
          : [],
    });

    return {
      shares,
      viewerAccessLevel,
      isPrivate,
      creatorWorkspaceMemberId,
    };
  }

  private async findPrivateRecordState({
    workspaceId,
    flatObjectMetadata,
    recordId,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordId: string;
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<PrivateRecordState | undefined> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const privateRecordStates =
      await this.privateRecordRepository.findPrivateRecordStates({
        workspaceId,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        recordIds: [recordId],
        transactionScope,
      });

    return privateRecordStates.get(recordId);
  }

  private async findPermissions({
    args,
    flatObjectMetadata,
  }: {
    args: RecordSharingArgs;
    flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
  }): Promise<RecordPermissionsDTO> {
    const permissionsByRecordId =
      await this.recordPermissionsReadService.findRecordsActions({
        authContext: args.authContext,
        objectNameSingular: flatObjectMetadata.nameSingular,
        recordIds: [args.recordId],
        transactionScope: args.transactionScope,
      });

    return (
      permissionsByRecordId.get(args.recordId) ?? DENIED_RECORD_PERMISSIONS
    );
  }

  private async findFlatObjectMetadataAndFeatureFlagsMapOrThrow({
    authContext,
    objectMetadataId,
  }: Pick<RecordSharingArgs, 'authContext' | 'objectMetadataId'>): Promise<{
    flatObjectMetadata: FlatObjectMetadata;
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  }> {
    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatObjectMetadataMaps', 'featureFlagsMap'],
      );

    return {
      flatObjectMetadata: findRecordSharingFlatObjectMetadataOrThrow({
        objectMetadataId,
        flatObjectMetadataMaps,
      }),
      featureFlagsMap,
    };
  }
}
