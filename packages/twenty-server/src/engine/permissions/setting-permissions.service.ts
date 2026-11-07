import { Injectable } from '@nestjs/common';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { followUpdateWhenCreatePermissionIsDisabled } from 'src/engine/permissions/internal/role/utils/follow-update-when-create-permission-is-disabled.util';
import { computePrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/compute-principals-records-permissions.util';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { isPermissionFlagGrantedToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/is-permission-flag-granted-to-flat-role.util';
import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { findUserWorkspaceFlatRoleOrThrow } from 'src/engine/permissions/internal/principal/utils/find-user-workspace-flat-role-or-throw.util';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class SettingPermissionsService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly principalPermissionsService: PrincipalPermissionsService,
  ) {}

  public async getUserWorkspacePermissions({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<UserWorkspacePermissions> {
    const {
      featureFlagsMap,
      userWorkspaceRoleMap,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
      rolesPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'featureFlagsMap',
      'userWorkspaceRoleMap',
      'flatRoleMaps',
      'flatRolePermissionFlagMaps',
      'rolesPermissions',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatApplicationMaps',
    ]);

    const flatRole = findUserWorkspaceFlatRoleOrThrow({
      userWorkspaceId,
      userWorkspaceRoleMap,
      flatRoleMaps,
    });

    const permissionFlags = Object.fromEntries(
      Object.values(PermissionFlagType).map((permissionFlag) => [
        permissionFlag,
        isPermissionFlagGrantedToFlatRole({
          flatRole,
          permissionFlag,
          flatRolePermissionFlagMaps,
        }),
      ]),
    ) as Record<PermissionFlagType, boolean>;

    return {
      permissionFlags,
      recordsPermissions: followUpdateWhenCreatePermissionIsDisabled({
        recordsPermissions: computePrincipalsRecordsPermissions({
          principals: buildRolePermissionsPrincipals({
            workspaceId,
            roleId: flatRole.id,
          }),
          rolesPermissions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          flatApplicationMaps,
        }),
        featureFlagsMap,
      }),
    };
  }

  public getDefaultUserWorkspacePermissions = (): UserWorkspacePermissions => ({
    permissionFlags: Object.fromEntries(
      Object.values(PermissionFlagType).map((permissionFlag) => [
        permissionFlag,
        false,
      ]),
    ) as Record<PermissionFlagType, boolean>,
    recordsPermissions: NO_ROLE_RECORDS_PERMISSIONS,
  });

  public async hasPermissionFlag({
    authContext,
    permissionFlag,
  }: {
    authContext: WorkspaceAuthContext | undefined;
    permissionFlag: PermissionFlagType;
  }): Promise<boolean> {
    if (!isDefined(authContext)) {
      return false;
    }

    if (isSystemAuthContext(authContext)) {
      return true;
    }

    const principals =
      await this.principalPermissionsService.resolvePermissionsPrincipals({
        authContext,
      });

    if (!isDefined(principals)) {
      return false;
    }

    const { flatRoleMaps, flatRolePermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(principals.workspaceId, [
        'flatRoleMaps',
        'flatRolePermissionFlagMaps',
      ]);

    const { aiRunScope } = principals;

    return (
      (!isDefined(aiRunScope) ||
        (aiRunScope.permissionFlags[permissionFlag] ?? false)) &&
      this.isPermissionFlagGrantedToRoles({
        roleIds: getPermissionsPrincipalsRoleIds(principals),
        permissionFlag,
        flatRoleMaps,
        flatRolePermissionFlagMaps,
      })
    );
  }

  public async userWorkspaceHasPermissionFlag({
    workspaceId,
    userWorkspaceId,
    permissionFlag,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    permissionFlag: PermissionFlagType;
  }): Promise<boolean> {
    const { userWorkspaceRoleMap, flatRoleMaps, flatRolePermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
        'flatRoleMaps',
        'flatRolePermissionFlagMaps',
      ]);

    return this.isPermissionFlagGrantedToRoles({
      roleIds: [userWorkspaceRoleMap[userWorkspaceId]],
      permissionFlag,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
    });
  }

  public async applicationHasPermissionFlag({
    workspaceId,
    applicationId,
    permissionFlag,
  }: {
    workspaceId: string;
    applicationId: string;
    permissionFlag: PermissionFlagType;
  }): Promise<boolean> {
    const { flatApplicationMaps, flatRoleMaps, flatRolePermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
        'flatRoleMaps',
        'flatRolePermissionFlagMaps',
      ]);
    const application = this.findActiveApplication({
      applicationId,
      flatApplicationMaps,
    });

    return this.isPermissionFlagGrantedToRoles({
      roleIds: [application?.defaultRoleId ?? undefined],
      permissionFlag,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
    });
  }

  // Like the ORM, a role missing from the cache grants nothing, and every role must grant the flag
  private isPermissionFlagGrantedToRoles({
    roleIds,
    permissionFlag,
    flatRoleMaps,
    flatRolePermissionFlagMaps,
  }: {
    roleIds: (string | undefined)[];
    permissionFlag: PermissionFlagType;
    flatRoleMaps: FlatRoleMaps;
    flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
  }): boolean {
    return (
      roleIds.length > 0 &&
      roleIds.every((roleId) => {
        const flatRole = isDefined(roleId)
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: roleId,
              flatEntityMaps: flatRoleMaps,
            })
          : undefined;

        return (
          isDefined(flatRole) &&
          isPermissionFlagGrantedToFlatRole({
            flatRole,
            permissionFlag,
            flatRolePermissionFlagMaps,
          })
        );
      })
    );
  }

  // undefined entries are roles a caller should have but does not, which deny
  // The application cache also holds soft-deleted applications
  private findActiveApplication({
    applicationId,
    flatApplicationMaps,
  }: {
    applicationId: string;
    flatApplicationMaps: FlatApplicationCacheMaps;
  }): FlatApplication | undefined {
    const application = flatApplicationMaps.byId[applicationId];

    return isDefined(application) && !isDefined(application.deletedAt)
      ? application
      : undefined;
  }
}
