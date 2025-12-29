import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
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
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
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
    const permissionFlags = Object.keys(PermissionFlagType).reduce(
      (acc, feature) => {
        const hasBasePermission = this.isToolPermission(feature)
          ? roleOfUserWorkspace.canAccessAllTools
          : roleOfUserWorkspace.canUpdateAllSettings;

        return {
          ...acc,
          [feature]:
            hasBasePermission ||
            roleOfUserWorkspace.permissionFlags.some(
              (permissionFlag) => permissionFlag.flag === feature,
            ),
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
        [PermissionFlagType.HTTP_REQUEST_TOOL]: false,
        [PermissionFlagType.CODE_INTERPRETER_TOOL]: false,
        [PermissionFlagType.IMPORT_CSV]: false,
        [PermissionFlagType.EXPORT_CSV]: false,
        [PermissionFlagType.CONNECTED_ACCOUNTS]: false,
        [PermissionFlagType.IMPERSONATE]: false,
        [PermissionFlagType.SSO_BYPASS]: false,
        [PermissionFlagType.PROFILE_INFORMATION]: false,
      },
      objectsPermissions: {},
    }) as const satisfies UserWorkspacePermissions;

  public async userHasWorkspaceSettingPermission({
    userWorkspaceId,
    workspaceId,
    setting,
    apiKeyId,
  }: {
    userWorkspaceId?: string;
    workspaceId: string;
    setting: PermissionFlagType;
    apiKeyId?: string;
  }): Promise<boolean> {
    if (isDefined(apiKeyId)) {
      const roleId = await this.apiKeyRoleService.getRoleIdForApiKeyId(
        apiKeyId,
        workspaceId,
      );

      const role = await this.roleRepository.findOne({
        where: { id: roleId, workspaceId },
        relations: ['permissionFlags'],
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

      return this.checkRolePermissions(roleOfUserWorkspace, setting);
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.NO_AUTHENTICATION_CONTEXT,
      PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      {
        userFriendlyMessage: msg`Authentication is required to access this feature. Please sign in and try again.`,
      },
    );
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

    const permissionFlags = role.permissionFlags ?? [];

    return permissionFlags.some(
      (permissionFlag) => permissionFlag.flag === setting,
    );
  }

  private async getRolesFromPermissionConfig(
    rolePermissionConfig: RolePermissionConfig,
    workspaceId: string,
    relations: string[] = [],
  ): Promise<{ roles: RoleEntity[]; useIntersection: boolean } | null> {
    if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
      return null;
    }

    let roleIds: string[] = [];
    let useIntersection = false;

    if ('intersectionOf' in rolePermissionConfig) {
      roleIds = rolePermissionConfig.intersectionOf;
      useIntersection = true;
    } else if ('unionOf' in rolePermissionConfig) {
      roleIds = rolePermissionConfig.unionOf;
      useIntersection = false;
    }

    if (roleIds.length === 0) {
      throw new Error('No role IDs provided');
    }

    const roles = await this.roleRepository.find({
      where: { id: In(roleIds), workspaceId },
      relations,
    });

    if (roles.length !== roleIds.length) {
      throw new Error('Some roles not found');
    }

    return { roles, useIntersection };
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
        ['permissionFlags'],
      );

      if (result === null) {
        return true;
      }

      const { roles, useIntersection } = result;

      return useIntersection
        ? roles.every((role) => this.checkRolePermissions(role, setting))
        : roles.some((role) => this.checkRolePermissions(role, setting));
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
        ['permissionFlags'],
      );

      if (result === null) {
        return true;
      }

      const { roles, useIntersection } = result;

      const checkRoleHasPermission = (role: RoleEntity) => {
        if (role.canAccessAllTools === true) {
          return true;
        }

        const permissionFlags = role.permissionFlags ?? [];

        return permissionFlags.some(
          (permissionFlag) => permissionFlag.flag === flag,
        );
      };

      return useIntersection
        ? roles.every(checkRoleHasPermission)
        : roles.some(checkRoleHasPermission);
    } catch {
      return false;
    }
  }
}
