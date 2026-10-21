import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

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
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import {
  type RoleIdsBySource,
  type RolePermissionConfig,
} from 'src/engine/twenty-orm/types/role-permission-config.type';
import { buildAgentRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-agent-role-ids-by-source.util';
import { buildUserRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-user-role-ids-by-source.util';
import { getRoleIdsToIntersect } from 'src/engine/twenty-orm/utils/get-role-ids-to-intersect.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
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
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'userWorkspaceRoleMap',
      'flatRoleMaps',
      'flatRolePermissionFlagMaps',
      'rolesPermissions',
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
      objectsPermissions: rolesPermissions[flatRole.id] ?? {},
    };
  }

  public getDefaultUserWorkspacePermissions = (): UserWorkspacePermissions => ({
    permissionFlags: Object.fromEntries(
      Object.values(PermissionFlagType).map((permissionFlag) => [
        permissionFlag,
        false,
      ]),
    ) as Record<PermissionFlagType, boolean>,
    objectsPermissions: {},
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

    const callerRoleIdsBySource =
      await this.resolveCallerRoleIdsBySourceOrThrow({
        workspaceId,
        userWorkspaceId,
        apiKeyId,
        applicationId,
        userWorkspaceRoleMap,
        flatApplicationMaps,
        flatRoleMaps,
      });

    return this.isPermissionFlagGrantedToRoles({
      roleIdsBySource: {
        ...callerRoleIdsBySource,
        ...buildAgentRoleIdsBySource({
          agentId,
          flatRoleTargetByAgentIdMaps,
        }),
      },
      setting,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
    });
  }

  public async checkRolesPermissions(
    rolePermissionConfig: RolePermissionConfig,
    workspaceId: string,
    setting: PermissionFlagType,
  ): Promise<boolean> {
    if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
      return true;
    }

    const { flatRoleMaps, flatRolePermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleMaps',
        'flatRolePermissionFlagMaps',
      ]);

    return this.isPermissionFlagGrantedToRoles({
      roleIdsBySource: rolePermissionConfig.intersectionOf,
      setting,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
    });
  }

  // Like the ORM, a role missing from the cache grants nothing
  private isPermissionFlagGrantedToRoles({
    roleIdsBySource,
    setting,
    flatRoleMaps,
    flatRolePermissionFlagMaps,
  }: {
    roleIdsBySource: RoleIdsBySource;
    setting: PermissionFlagType;
    flatRoleMaps: FlatRoleMaps;
    flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
  }): boolean {
    const roleIds = getRoleIdsToIntersect(roleIdsBySource);

    return (
      isDefined(roleIds) &&
      roleIds.every((roleId) => {
        const flatRole = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: roleId,
          flatEntityMaps: flatRoleMaps,
        });

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

  private async resolveCallerRoleIdsBySourceOrThrow({
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
  }): Promise<RoleIdsBySource> {
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

      return { apiKeyRoleId: apiKeyFlatRole.id };
    }

    if (isDefined(userWorkspaceId)) {
      const userFlatRole = this.findUserWorkspaceFlatRoleOrThrow({
        userWorkspaceId,
        userWorkspaceRoleMap,
        flatRoleMaps,
      });

      if (!isDefined(applicationId)) {
        return { userWorkspaceRoleId: userFlatRole.id };
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

      return buildUserRoleIdsBySource({
        userRoleId: userFlatRole.id,
        application: {
          defaultRoleId: this.findApplicationRoleIdOrThrow({
            application,
            flatRoleMaps,
          }),
        },
      });
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

      return {
        applicationRoleId: this.findApplicationRoleIdOrThrow({
          application,
          flatRoleMaps,
        }),
      };
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
