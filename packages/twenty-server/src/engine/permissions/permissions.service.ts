import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/role/constants/no-role-records-permissions.constant';
import { computePrincipalsRecordsPermissions } from 'src/engine/permissions/role/utils/compute-principals-records-permissions.util';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { isPermissionFlagGrantedToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/is-permission-flag-granted-to-flat-role.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type UserWorkspacePermissions } from 'src/engine/permissions/types/user-workspace-permissions.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principals-role-ids.util';
import { PermissionsPrincipalsService } from 'src/engine/permissions/principal/services/permissions-principals.service';
import { resolveApplicationRoleId } from 'src/engine/permissions/principal/utils/resolve-application-role-id.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    private readonly permissionsPrincipalsService: PermissionsPrincipalsService,
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
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'userWorkspaceRoleMap',
      'flatRoleMaps',
      'flatRolePermissionFlagMaps',
      'rolesPermissions',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatApplicationMaps',
    ]);

    const flatRole = this.findUserWorkspaceFlatRoleOrThrow({
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
      recordsPermissions: computePrincipalsRecordsPermissions({
        principals: {
          mainPrincipal: { type: 'role', roleId: flatRole.id },
          applicationPrincipal: { type: 'customApplication' },
        },
        rolesPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatApplicationMaps,
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

  public async userHasWorkspaceSettingPermission({
    userWorkspaceId,
    workspaceId,
    setting,
    apiKeyId,
    applicationId,
    agentId,
  }: {
    userWorkspaceId: string | undefined;
    workspaceId: string;
    setting: PermissionFlagType;
    apiKeyId?: string;
    applicationId: string | undefined;
    agentId: string | undefined;
  }): Promise<boolean> {
    const {
      userWorkspaceRoleMap,
      flatApplicationMaps,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
      flatRoleTargetByAgentIdMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'userWorkspaceRoleMap',
      'flatApplicationMaps',
      'flatRoleMaps',
      'flatRolePermissionFlagMaps',
      'flatRoleTargetByAgentIdMaps',
    ]);

    const callerRoleIds = await this.resolveCallerRoleIdsOrThrow({
      workspaceId,
      userWorkspaceId,
      apiKeyId,
      applicationId,
      userWorkspaceRoleMap,
      flatApplicationMaps,
      flatRoleMaps,
    });

    return this.isPermissionFlagGrantedToRoles({
      roleIds: isDefined(agentId)
        ? [...callerRoleIds, flatRoleTargetByAgentIdMaps[agentId]?.roleId]
        : callerRoleIds,
      setting,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
    });
  }

  public async hasPermissionFlag({
    authContext,
    setting,
  }: {
    authContext: WorkspaceAuthContext | undefined;
    setting: PermissionFlagType;
  }): Promise<boolean> {
    if (!isDefined(authContext)) {
      return false;
    }

    if (isSystemAuthContext(authContext)) {
      return true;
    }

    const principals =
      await this.permissionsPrincipalsService.findPrincipalsWithRoles(
        authContext,
      );

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
        (aiRunScope.permissionFlags[setting] ?? false)) &&
      this.isPermissionFlagGrantedToRoles({
        roleIds: getPermissionsPrincipalsRoleIds(principals),
        setting,
        flatRoleMaps,
        flatRolePermissionFlagMaps,
      })
    );
  }

  // Empty for the system, which acts with no role
  public async getRoleIds(
    authContext: WorkspaceAuthContext | undefined,
  ): Promise<string[]> {
    if (!isDefined(authContext) || isSystemAuthContext(authContext)) {
      return [];
    }

    const principals =
      await this.permissionsPrincipalsService.findPrincipalsWithRoles(
        authContext,
      );

    return isDefined(principals)
      ? getPermissionsPrincipalsRoleIds(principals)
      : [];
  }

  // Like the ORM, a role missing from the cache grants nothing, and every role must grant the flag
  private isPermissionFlagGrantedToRoles({
    roleIds,
    setting,
    flatRoleMaps,
    flatRolePermissionFlagMaps,
  }: {
    roleIds: (string | undefined)[];
    setting: PermissionFlagType;
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
            permissionFlag: setting,
            flatRolePermissionFlagMaps,
          })
        );
      })
    );
  }

  // undefined entries are roles a caller should have but does not, which deny
  private async resolveCallerRoleIdsOrThrow({
    workspaceId,
    userWorkspaceId,
    apiKeyId,
    applicationId,
    userWorkspaceRoleMap,
    flatApplicationMaps,
    flatRoleMaps,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    apiKeyId: string | undefined;
    applicationId: string | undefined;
    userWorkspaceRoleMap: UserWorkspaceRoleMap;
    flatApplicationMaps: FlatApplicationCacheMaps;
    flatRoleMaps: FlatRoleMaps;
  }): Promise<(string | undefined)[]> {
    if (isDefined(apiKeyId)) {
      const apiKeyRoleId = await this.apiKeyRoleService.getRoleIdForApiKeyId(
        apiKeyId,
        workspaceId,
      );

      const apiKeyFlatRole = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: apiKeyRoleId,
        flatEntityMaps: flatRoleMaps,
      });

      if (!isDefined(apiKeyFlatRole)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.API_KEY_ROLE_NOT_FOUND,
          PermissionsExceptionCode.API_KEY_ROLE_NOT_FOUND,
          {
            userFriendlyMessage: msg`The API key does not have a valid role assigned. Please check your API key configuration.`,
          },
        );
      }

      return [apiKeyFlatRole.id];
    }

    if (isDefined(userWorkspaceId)) {
      const userFlatRole = this.findUserWorkspaceFlatRoleOrThrow({
        userWorkspaceId,
        userWorkspaceRoleMap,
        flatRoleMaps,
      });

      if (!isDefined(applicationId)) {
        return [userFlatRole.id];
      }

      const application = this.findActiveApplication({
        applicationId,
        flatApplicationMaps,
      });

      // A deleted application must not fall back to the user's full permissions
      if (!isDefined(application)) {
        throw new ApplicationException(
          `Could not find application ${applicationId}`,
          ApplicationExceptionCode.APPLICATION_NOT_FOUND,
        );
      }

      return [
        userFlatRole.id,
        resolveApplicationRoleId({
          application: {
            defaultRoleId: this.findApplicationRoleIdOrThrow({
              application,
              flatRoleMaps,
            }),
            sourceType: application.sourceType,
          },
          userRoleId: userFlatRole.id,
        }),
      ];
    }

    if (isDefined(applicationId)) {
      const application = this.findActiveApplication({
        applicationId,
        flatApplicationMaps,
      });

      if (!isDefined(application)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.NO_AUTHENTICATION_CONTEXT,
          PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
        );
      }

      return [
        this.findApplicationRoleIdOrThrow({ application, flatRoleMaps }) ??
          undefined,
      ];
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.NO_AUTHENTICATION_CONTEXT,
      PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      {
        userFriendlyMessage: msg`Authentication is required to access this feature. Please sign in and try again.`,
      },
    );
  }

  private findUserWorkspaceFlatRoleOrThrow({
    userWorkspaceId,
    userWorkspaceRoleMap,
    flatRoleMaps,
  }: {
    userWorkspaceId: string;
    userWorkspaceRoleMap: UserWorkspaceRoleMap;
    flatRoleMaps: FlatRoleMaps;
  }): FlatRole {
    const roleId = userWorkspaceRoleMap[userWorkspaceId];

    const flatRole = isDefined(roleId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: roleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;

    if (!isDefined(flatRole)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        {
          userFriendlyMessage: msg`Your role in this workspace could not be found. Please contact your workspace administrator.`,
        },
      );
    }

    return flatRole;
  }

  private findApplicationRoleIdOrThrow({
    application,
    flatRoleMaps,
  }: {
    application: FlatApplication;
    flatRoleMaps: FlatRoleMaps;
  }): string | null {
    if (!isDefined(application.defaultRoleId)) {
      return null;
    }

    const flatRole = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: application.defaultRoleId,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(flatRole)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.APPLICATION_ROLE_NOT_FOUND,
        PermissionsExceptionCode.APPLICATION_ROLE_NOT_FOUND,
        {
          userFriendlyMessage: msg`The application does not have a valid role assigned. Please check your application configuration.`,
        },
      );
    }

    return flatRole.id;
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
