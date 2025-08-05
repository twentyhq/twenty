import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { TOOL_PERMISSION_FLAGS } from 'src/engine/metadata-modules/permissions/constants/tool-permission-flags';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(RoleEntity, 'core')
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
          userFriendlyMessage:
            'Your role in this workspace could not be found. Please contact your workspace administrator.',
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

    const { data: rolesPermissions } =
      await this.workspacePermissionsCacheService.getRolesPermissionsFromCache({
        workspaceId,
      });

    const objectPermissions = rolesPermissions[roleOfUserWorkspace.id] ?? {};

    const objectRecordsPermissions: UserWorkspacePermissions['objectRecordsPermissions'] =
      {
        [PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS]:
          roleOfUserWorkspace.canReadAllObjectRecords ?? false,
        [PermissionsOnAllObjectRecords.UPDATE_ALL_OBJECT_RECORDS]:
          roleOfUserWorkspace.canUpdateAllObjectRecords ?? false,
        [PermissionsOnAllObjectRecords.SOFT_DELETE_ALL_OBJECT_RECORDS]:
          roleOfUserWorkspace.canSoftDeleteAllObjectRecords ?? false,
        [PermissionsOnAllObjectRecords.DESTROY_ALL_OBJECT_RECORDS]:
          roleOfUserWorkspace.canDestroyAllObjectRecords ?? false,
      };

    return {
      permissionFlags,
      objectRecordsPermissions,
      objectPermissions,
    };
  }

  public getDefaultUserWorkspacePermissions = () =>
    ({
      objectRecordsPermissions: {
        [PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS]: false,
        [PermissionsOnAllObjectRecords.UPDATE_ALL_OBJECT_RECORDS]: false,
        [PermissionsOnAllObjectRecords.SOFT_DELETE_ALL_OBJECT_RECORDS]: false,
        [PermissionsOnAllObjectRecords.DESTROY_ALL_OBJECT_RECORDS]: false,
      },
      permissionFlags: {
        [PermissionFlagType.API_KEYS_AND_WEBHOOKS]: false,
        [PermissionFlagType.WORKSPACE]: false,
        [PermissionFlagType.WORKSPACE_MEMBERS]: false,
        [PermissionFlagType.ROLES]: false,
        [PermissionFlagType.DATA_MODEL]: false,
        [PermissionFlagType.ADMIN_PANEL]: false,
        [PermissionFlagType.SECURITY]: false,
        [PermissionFlagType.WORKFLOWS]: false,
        [PermissionFlagType.SEND_EMAIL_TOOL]: false,
        [PermissionFlagType.IMPORT_CSV]: false,
        [PermissionFlagType.EXPORT_CSV]: false,
      },
      objectPermissions: {},
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
    if (apiKeyId) {
      const isApiKeyRolesEnabled =
        await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_API_KEY_ROLES_ENABLED,
          workspaceId,
        );

      if (!isApiKeyRolesEnabled) {
        return true;
      }

      const roleId = await this.apiKeyRoleService.getRoleIdForApiKey(
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
            userFriendlyMessage:
              'The API key does not have a valid role assigned. Please check your API key configuration.',
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
            userFriendlyMessage:
              'Your role in this workspace could not be found. Please contact your workspace administrator.',
          },
        );
      }

      return this.checkRolePermissions(roleOfUserWorkspace, setting);
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.NO_AUTHENTICATION_CONTEXT,
      PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      {
        userFriendlyMessage:
          'Authentication is required to access this feature. Please sign in and try again.',
      },
    );
  }

  private checkRolePermissions(
    role: RoleEntity,
    setting: PermissionFlagType,
  ): boolean {
    if (role.canUpdateAllSettings === true) {
      return true;
    }

    const permissionFlags = role.permissionFlags ?? [];

    return permissionFlags.some(
      (permissionFlag) => permissionFlag.flag === setting,
    );
  }

  public async hasToolPermission(
    roleId: string,
    workspaceId: string,
    flag: PermissionFlagType,
  ): Promise<boolean> {
    try {
      const role = await this.roleRepository.findOne({
        where: { id: roleId, workspaceId },
        relations: ['permissionFlags'],
      });

      if (!role) {
        return false;
      }

      if (role.canAccessAllTools === true) {
        return true;
      }

      const permissionFlags = role.permissionFlags ?? [];

      return permissionFlags.some(
        (permissionFlag) => permissionFlag.flag === flag,
      );
    } catch (error) {
      return false;
    }
  }
}
