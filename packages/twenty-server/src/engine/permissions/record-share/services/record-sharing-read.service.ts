/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { PermissionsPrincipalsService } from 'src/engine/permissions/principal/services/permissions-principals.service';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principals-role-ids.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/principal/utils/get-permissions-principals-share-keys.util';
import { RecordPermissionReadOrmService } from 'src/engine/permissions/record-permission-orm/services/record-permission-read-orm.service';
import { DENIED_RECORD_PERMISSIONS } from 'src/engine/permissions/record-permissions/constants/denied-record-permissions.constant';
import { type RecordPermissionsDTO } from 'src/engine/permissions/record-permissions/dtos/record-permissions.dto';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions/services/record-permissions.service';
import {
  type RecordSharingDTO,
  type RecordSharingGrantDTO,
  type RecordSharingRoleDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { resolveRecordSharePrincipalRoleIds } from 'src/engine/permissions/record-share/utils/resolve-record-share-principal-role-ids.util';
import { resolveRecordIdsSharedWithPrincipals } from 'src/engine/permissions/record-share/utils/resolve-record-ids-shared-with-principals.util';
import {
  type RecordSharingObject,
  resolveRecordSharingObjectOrThrow,
} from 'src/engine/permissions/record-share/utils/resolve-record-sharing-object-or-throw.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/record-share/utils/resolve-required-record-share-access-levels.util';
import { resolveViewerRecordShareAccessLevel } from 'src/engine/permissions/record-share/utils/resolve-viewer-record-share-access-level.util';
import { canRolesAccessAllRecords } from 'src/engine/permissions/role/utils/can-roles-access-all-records.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type ViewerRecordAccess = {
  viewerAccessLevel: RecordShareAccessLevel | null;
  creatorWorkspaceMemberId: string | undefined;
};

@Injectable()
export class RecordSharingReadService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordPermissionReadOrmService: RecordPermissionReadOrmService,
    private readonly recordPermissionsService: RecordPermissionsService,
    private readonly permissionsPrincipalsService: PermissionsPrincipalsService,
  ) {}

  async findRecordSharing(args: RecordSharingArgs): Promise<RecordSharingDTO> {
    const sharingObject = await this.findSharingObject(args);
    const permissions = await this.findPermissions({ args, sharingObject });

    if (!permissions.canRead) {
      throw new NotFoundError('Record not found');
    }

    return this.buildSharingResponse({ args, sharingObject, permissions });
  }

  async findRecordSharingAfterChange(
    args: RecordSharingArgs,
  ): Promise<RecordSharingDTO> {
    const sharingObject = await this.findSharingObject(args);
    const permissions = await this.findPermissions({ args, sharingObject });

    if (!permissions.canRead) {
      return {
        isShareable: sharingObject.isShareable,
        isPrivate: false,
        canManageSharing: false,
        permissions,
        hasManagedGeneralAccess: false,
        roles: [],
        shares: [],
      };
    }

    return this.buildSharingResponse({ args, sharingObject, permissions });
  }

  async findViewerRecordAccess(
    args: RecordSharingArgs & { transactionScope: WorkspaceTransactionScope },
  ): Promise<ViewerRecordAccess> {
    const { viewerAccessLevel, creatorWorkspaceMemberId } =
      await this.findRecordShareState({
        ...args,
        sharingObject: await this.findSharingObject(args),
      });

    return { viewerAccessLevel, creatorWorkspaceMemberId };
  }

  async canRoleUpdateSharedRecord({
    workspaceId,
    objectMetadataId,
    recordId,
    roleId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordId: string;
    roleId: string;
  }): Promise<boolean> {
    const recordShares =
      await this.recordPermissionReadOrmService.findRecordShares({
        workspaceId,
        objectMetadataId,
        recordIds: [recordId],
      });

    return resolveRecordIdsSharedWithPrincipals({
      recordShares,
      principalIds: [roleId],
      accessLevels: resolveRequiredRecordShareAccessLevels('update'),
    }).has(recordId);
  }

  async isRecordSharedBeyondMember({
    workspaceId,
    objectMetadataId,
    recordId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordId: string;
    workspaceMemberId: string;
  }): Promise<boolean> {
    const recordShares =
      await this.recordPermissionReadOrmService.findRecordShares({
        workspaceId,
        objectMetadataId,
        recordIds: [recordId],
      });

    return recordShares.some(
      ({ principalType, principalId }) =>
        principalType !== RecordSharePrincipalType.WORKSPACE_MEMBER ||
        principalId !== workspaceMemberId,
    );
  }

  private async buildSharingResponse({
    args,
    sharingObject,
    permissions,
  }: {
    args: RecordSharingArgs;
    sharingObject: RecordSharingObject;
    permissions: RecordPermissionsDTO;
  }): Promise<RecordSharingDTO> {
    const { flatObjectMetadata } = sharingObject;
    const { shares, viewerAccessLevel, isPrivate } =
      await this.findRecordShareState({
        ...args,
        sharingObject,
      });
    const canManageSharing =
      sharingObject.isShareable &&
      permissions.canUpdate &&
      viewerAccessLevel === RecordShareAccessLevel.FULL &&
      (await this.isUpdatePermittedByRole({
        authContext: args.authContext,
        flatObjectMetadata,
      }));
    const grants = shares.filter(
      (share) =>
        share.principalType !== RecordSharePrincipalType.EVERYONE &&
        share.accessLevel !== RecordShareAccessLevel.NONE,
    );

    return {
      isShareable: sharingObject.isShareable,
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
            operationType: 'select',
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
    sharingObject,
    transactionScope,
  }: RecordSharingArgs & {
    sharingObject: RecordSharingObject;
    transactionScope?: WorkspaceTransactionScope;
  }) {
    const workspaceId = authContext.workspace.id;
    const { flatObjectMetadata, isShareable } = sharingObject;
    const { roleIdsWithAllRecordsAccess } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'roleIdsWithAllRecordsAccess',
      ]);
    const principals =
      await this.permissionsPrincipalsService.findPrincipalsWithRoles(
        authContext,
      );
    const canAccessAllRecords =
      isDefined(principals) &&
      canRolesAccessAllRecords({
        roleIds: getPermissionsPrincipalsRoleIds(principals),
        roleIdsWithAllRecordsAccess,
      });
    const shares = await this.recordPermissionReadOrmService.findRecordShares({
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
      implicitAccessLevels: isShareable
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
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<PrivateRecordState | undefined> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const privateRecordStates =
      await this.recordPermissionReadOrmService.findPrivateRecordStates({
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
    sharingObject,
  }: {
    args: RecordSharingArgs;
    sharingObject: RecordSharingObject;
  }): Promise<RecordPermissionsDTO> {
    const permissionsByRecordId =
      await this.recordPermissionsService.getPermissionsForRecords({
        authContext: args.authContext,
        flatObjectMetadata: sharingObject.flatObjectMetadata,
        recordIds: [args.recordId],
      });

    return (
      permissionsByRecordId.get(args.recordId) ?? DENIED_RECORD_PERMISSIONS
    );
  }

  private isUpdatePermittedByRole({
    authContext,
    flatObjectMetadata,
  }: Pick<RecordSharingArgs, 'authContext'> & {
    flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
  }): Promise<boolean> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository(flatObjectMetadata.nameSingular)
          .isObjectOperationPermittedByRole('update'),
      authContext,
    );
  }

  private async findSharingObject({
    authContext,
    objectMetadataId,
  }: Pick<
    RecordSharingArgs,
    'authContext' | 'objectMetadataId'
  >): Promise<RecordSharingObject> {
    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatObjectMetadataMaps', 'featureFlagsMap'],
      );

    return resolveRecordSharingObjectOrThrow({
      objectMetadataId,
      flatObjectMetadataMaps,
      featureFlagsMap,
    });
  }
}
