import { Injectable } from '@nestjs/common';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
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
import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { findUserWorkspaceRoleIdsOrThrow } from 'src/engine/permissions/internal/principal/utils/find-user-workspace-role-ids-or-throw.util';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ApplicationGrantRoleLookupService } from 'src/engine/core-modules/application/application-grant-role-lookup/services/application-grant-role-lookup.service';

@Injectable()
export class SettingPermissionsService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
    private readonly applicationGrantRoleLookupService: ApplicationGrantRoleLookupService,
  ) {}

  public async getUserWorkspacePermissions({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<UserWorkspacePermissions> {
    const {
      userWorkspaceRoleMap,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
      rolesPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'userWorkspaceRoleMap',
      'flatRoleMaps',
      'flatRolePermissionFlagMaps',
      'rolesPermissions',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);

    const roleIds = findUserWorkspaceRoleIdsOrThrow({
      userWorkspaceId,
      userWorkspaceRoleMap,
    });

    const permissionFlags = Object.fromEntries(
      Object.values(PermissionFlagType).map((permissionFlag) => [
        permissionFlag,
        roleIds.some((roleId) =>
          this.isPermissionFlagGrantedToRole({
            roleId,
            permissionFlag,
            flatRoleMaps,
            flatRolePermissionFlagMaps,
          }),
        ),
      ]),
    ) as Record<PermissionFlagType, boolean>;

    return {
      permissionFlags,
      recordsPermissions: computePrincipalsRecordsPermissions({
        principals: buildRolePermissionsPrincipals({
          workspaceId,
          roleIds,
        }),
        rolesPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
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
      await this.principalPermissionsReadService.resolvePermissionsPrincipals({
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

    const { runtimeLimitingRole } = principals;
    const isPermissionFlagGrantedToRole = (roleId: string) =>
      this.isPermissionFlagGrantedToRole({
        roleId,
        permissionFlag,
        flatRoleMaps,
        flatRolePermissionFlagMaps,
      });

    return (
      (!isDefined(runtimeLimitingRole) ||
        (runtimeLimitingRole.permissionFlags[permissionFlag] ?? false)) &&
      principals.mainPrincipal.roleIds.some(isPermissionFlagGrantedToRole) &&
      getPermissionsPrincipalsLimitingRoleIds(principals).every(
        isPermissionFlagGrantedToRole,
      )
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

    return (userWorkspaceRoleMap[userWorkspaceId] ?? []).some((roleId) =>
      this.isPermissionFlagGrantedToRole({
        roleId,
        permissionFlag,
        flatRoleMaps,
        flatRolePermissionFlagMaps,
      }),
    );
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
    const grantRoleId = isDefined(application)
      ? await this.applicationGrantRoleLookupService.findGrantRoleId({
          workspaceId,
          flatApplication: application,
        })
      : undefined;

    return this.isPermissionFlagGrantedToRole({
      roleId: grantRoleId,
      permissionFlag,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
    });
  }

  // Like the ORM, a role missing from the cache grants nothing
  private isPermissionFlagGrantedToRole({
    roleId,
    permissionFlag,
    flatRoleMaps,
    flatRolePermissionFlagMaps,
  }: {
    roleId: string | undefined;
    permissionFlag: PermissionFlagType;
    flatRoleMaps: FlatRoleMaps;
    flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
  }): boolean {
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
  }

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
