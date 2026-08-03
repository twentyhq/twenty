import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { flatRoleHasPermissionFlag } from 'src/engine/metadata-modules/flat-role/utils/flat-role-has-permission-flag.util';
import { TOOL_PERMISSION_FLAGS } from 'src/engine/metadata-modules/permissions/constants/tool-permission-flags';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';
import { resolveRoleIdsForUser } from 'src/engine/twenty-orm/utils/resolve-role-ids-for-user.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type CachedRolesFromPermissionConfig = {
  roles: FlatRole[];
  useIntersection: boolean;
  flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
} | null;

@Injectable()
export class PermissionsService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  private isToolPermission(feature: string) {
    return TOOL_PERMISSION_FLAGS.includes(feature);
  }

  public async getUserWorkspacePermissions({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<UserWorkspacePermissions> {
    const [roleOfUserWorkspace] = await this.userRoleService
      .getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId,
      })
      .then((roles) => roles?.get(userWorkspaceId) ?? []);

    if (!isDefined(roleOfUserWorkspace)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        {
          userFriendlyMessage: msg`Your role in this workspace could not be found. Please contact your workspace administrator.`,
        },
      );
    }

    const defaultSettingsPermissions =
      this.getDefaultUserWorkspacePermissions().permissionFlags;
    const permissionFlags = Object.values(PermissionFlagType).reduce(
      (acc, feature) => {
        const hasBasePermission = this.isToolPermission(feature)
          ? roleOfUserWorkspace.canAccessAllTools
          : roleOfUserWorkspace.canUpdateAllSettings;

        return {
          ...acc,
          [feature]:
            hasBasePermission ||
            this.roleHasPermissionFlag(roleOfUserWorkspace, feature),
        };
      },
      defaultSettingsPermissions,
    );

    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
      ]);

    const objectsPermissions = rolesPermissions[roleOfUserWorkspace.id] ?? {};

    return {
      permissionFlags,
      objectsPermissions,
    };
  }

  public getDefaultUserWorkspacePermissions = () =>
    ({
      permissionFlags: {
        [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: false,
        [PermissionFlagType.WORKSPACE]: false,
        [PermissionFlagType.WORKSPACE_MEMBERS]: false,
        [PermissionFlagType.ROLES]: false,
        [PermissionFlagType.DATA_MODEL]: false,
        [PermissionFlagType.SECURITY]: false,
        [PermissionFlagType.WORKFLOWS]: false,
        [PermissionFlagType.APPLICATIONS]: false,
        [PermissionFlagType.LAYOUTS]: false,
        [PermissionFlagType.VIEWS]: false,
        [PermissionFlagType.BILLING]: false,
        [PermissionFlagType.AI_SETTINGS]: false,
        [PermissionFlagType.AI]: false,
        [PermissionFlagType.UPLOAD_FILE]: false,
        [PermissionFlagType.DOWNLOAD_FILE]: false,
        [PermissionFlagType.SEND_EMAIL_TOOL]: false,
        [PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL]: false,
        [PermissionFlagType.HTTP_REQUEST_TOOL]: false,
        [PermissionFlagType.CODE_INTERPRETER_TOOL]: false,
        [PermissionFlagType.IMPORT_CSV]: false,
        [PermissionFlagType.EXPORT_CSV]: false,
        [PermissionFlagType.CONNECTED_ACCOUNTS]: false,
        [PermissionFlagType.IMPERSONATE]: false,
        [PermissionFlagType.SSO_BYPASS]: false,
        [PermissionFlagType.PROFILE_INFORMATION]: false,
        [PermissionFlagType.MARKETPLACE_APPS]: false,
      },
      objectsPermissions: {},
    }) as const satisfies UserWorkspacePermissions;

  public async userHasWorkspaceSettingPermission({
    userWorkspaceId,
    workspaceId,
    setting,
    apiKeyId,
    applicationId,
  }: {
    userWorkspaceId?: string;
    workspaceId: string;
    setting: PermissionFlagType;
    apiKeyId?: string;
    applicationId?: string;
  }): Promise<boolean> {
    if (isDefined(apiKeyId)) {
      const roleId = await this.apiKeyRoleService.getRoleIdForApiKeyId(
        apiKeyId,
        workspaceId,
      );

      const role = await this.roleRepository.findOne(workspaceId, {
        where: { id: roleId },
        relations: [
          'rolePermissionFlags',
          'rolePermissionFlags.permissionFlag',
        ],
      });

      if (!isDefined(role)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.API_KEY_ROLE_NOT_FOUND,
          PermissionsExceptionCode.API_KEY_ROLE_NOT_FOUND,
          {
            userFriendlyMessage: msg`The API key does not have a valid role assigned. Please check your API key configuration.`,
          },
        );
      }

      return this.checkRolePermissions(role, setting);
    }

    if (userWorkspaceId) {
      const [roleOfUserWorkspace] = await this.userRoleService
        .getRolesByUserWorkspaces({
          userWorkspaceIds: [userWorkspaceId],
          workspaceId,
        })
        .then((roles) => roles?.get(userWorkspaceId) ?? []);

      if (!isDefined(roleOfUserWorkspace)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
          PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
          {
            userFriendlyMessage: msg`Your role in this workspace could not be found. Please contact your workspace administrator.`,
          },
        );
      }

      const applicationRoleId = isDefined(applicationId)
        ? await this.findApplicationDefaultRoleIdOrThrow({
            applicationId,
            workspaceId,
          })
        : undefined;

      const roleIds = resolveRoleIdsForUser({
        userRoleId: roleOfUserWorkspace.id,
        applicationRoleId,
      });

      if (roleIds.length > 1) {
        return this.checkRolesPermissions(
          { intersectionOf: roleIds },
          workspaceId,
          setting,
        );
      }

      return this.checkRolePermissions(roleOfUserWorkspace, setting);
    }

    if (applicationId) {
      const application = await this.applicationRepository.findOne({
        where: { id: applicationId, workspaceId },
      });

      if (!isDefined(application) || !isDefined(application.defaultRoleId)) {
        throw new ApplicationException(
          `Could not find application ${applicationId}`,
          ApplicationExceptionCode.APPLICATION_NOT_FOUND,
        );
      }

      const applicationRoleId = application.defaultRoleId;

      const role = await this.roleRepository.findOne(workspaceId, {
        where: { id: applicationRoleId },
        relations: [
          'rolePermissionFlags',
          'rolePermissionFlags.permissionFlag',
        ],
      });

      if (!isDefined(role)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.APPLICATION_ROLE_NOT_FOUND,
          PermissionsExceptionCode.APPLICATION_ROLE_NOT_FOUND,
          {
            userFriendlyMessage: msg`The application does not have a valid role assigned. Please check your application configuration.`,
          },
        );
      }

      return this.checkRolePermissions(role, setting);
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.NO_AUTHENTICATION_CONTEXT,
      PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      {
        userFriendlyMessage: msg`Authentication is required to access this feature. Please sign in and try again.`,
      },
    );
  }

  // Declaring no role adds no bound beyond the user's own. Naming an
  // application that no longer exists is different, and must not fall back to
  // the full permissions of the user being acted for.
  private async findApplicationDefaultRoleIdOrThrow({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<string | undefined> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, workspaceId },
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Could not find application ${applicationId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return application.defaultRoleId ?? undefined;
  }

  public checkRolePermissions(
    role: RoleEntity,
    setting: PermissionFlagType,
  ): boolean {
    const hasBasePermission = this.isToolPermission(setting)
      ? role.canAccessAllTools
      : role.canUpdateAllSettings;

    if (hasBasePermission === true) {
      return true;
    }

    return this.roleHasPermissionFlag(role, setting);
  }

  private roleHasPermissionFlag(
    role: RoleEntity,
    flag: PermissionFlagType,
  ): boolean {
    const rolePermissionFlags = role.rolePermissionFlags ?? [];

    const permissionFlagUniversalIdentifier = SystemPermissionFlag[flag];

    return rolePermissionFlags.some(
      (rolePermissionFlag) =>
        rolePermissionFlag.permissionFlag.universalIdentifier ===
        permissionFlagUniversalIdentifier,
    );
  }

  private async getRolesFromPermissionConfig(
    rolePermissionConfig: RolePermissionConfig,
    workspaceId: string,
  ): Promise<CachedRolesFromPermissionConfig> {
    if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
      return null;
    }

    const roleIds = getRoleIdsFromRolePermissionConfig(rolePermissionConfig);
    const useIntersection = 'intersectionOf' in rolePermissionConfig;

    if (roleIds.length === 0) {
      throw new Error('No role IDs provided');
    }

    if (new Set(roleIds).size !== roleIds.length) {
      throw new Error('Duplicate role IDs provided');
    }

    const { flatRoleMaps, flatRolePermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleMaps',
        'flatRolePermissionFlagMaps',
      ]);
    const roles = roleIds
      .map((roleId) => {
        const roleUniversalIdentifier =
          flatRoleMaps.universalIdentifierById[roleId];

        return isDefined(roleUniversalIdentifier)
          ? flatRoleMaps.byUniversalIdentifier[roleUniversalIdentifier]
          : undefined;
      })
      .filter(isDefined);

    if (roles.length !== roleIds.length) {
      throw new Error('Some roles not found');
    }

    return { roles, useIntersection, flatRolePermissionFlagMaps };
  }

  private checkFlatRolePermissions(
    role: FlatRole,
    setting: PermissionFlagType,
    flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps,
  ): boolean {
    const hasBasePermission = this.isToolPermission(setting)
      ? role.canAccessAllTools
      : role.canUpdateAllSettings;

    return (
      hasBasePermission === true ||
      flatRoleHasPermissionFlag({
        flatRole: role,
        permissionFlag: setting,
        flatRolePermissionFlagMaps,
      })
    );
  }

  public async checkRolesPermissions(
    rolePermissionConfig: RolePermissionConfig,
    workspaceId: string,
    setting: PermissionFlagType,
  ): Promise<boolean> {
    try {
      const result = await this.getRolesFromPermissionConfig(
        rolePermissionConfig,
        workspaceId,
      );

      if (result === null) {
        return true;
      }

      const { roles, useIntersection, flatRolePermissionFlagMaps } = result;
      const checkRoleHasPermission = (role: FlatRole) =>
        this.checkFlatRolePermissions(
          role,
          setting,
          flatRolePermissionFlagMaps,
        );

      return useIntersection
        ? roles.every(checkRoleHasPermission)
        : roles.some(checkRoleHasPermission);
    } catch {
      return false;
    }
  }

  public async hasToolPermission(
    rolePermissionConfig: RolePermissionConfig,
    workspaceId: string,
    flag: PermissionFlagType,
  ): Promise<boolean> {
    try {
      const result = await this.getRolesFromPermissionConfig(
        rolePermissionConfig,
        workspaceId,
      );

      if (result === null) {
        return true;
      }

      const { roles, useIntersection, flatRolePermissionFlagMaps } = result;

      const checkRoleHasPermission = (role: FlatRole) => {
        if (role.canAccessAllTools === true) {
          return true;
        }

        return flatRoleHasPermissionFlag({
          flatRole: role,
          permissionFlag: flag,
          flatRolePermissionFlagMaps,
        });
      };

      return useIntersection
        ? roles.every(checkRoleHasPermission)
        : roles.some(checkRoleHasPermission);
    } catch {
      return false;
    }
  }
}
