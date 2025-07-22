import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from './permissions.exception';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

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

    let hasPermissionOnSettingFeature = false;

    if (!isDefined(roleOfUserWorkspace)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      );
    }

    if (roleOfUserWorkspace.canUpdateAllSettings === true) {
      hasPermissionOnSettingFeature = true;
    }

    const settingPermissions = roleOfUserWorkspace.settingPermissions ?? [];

    const defaultSettingsPermissions =
      this.getDefaultUserWorkspacePermissions().settingsPermissions;
    const settingsPermissions = Object.keys(SettingPermissionType).reduce(
      (acc, feature) => ({
        ...acc,
        [feature]:
          hasPermissionOnSettingFeature ||
          settingPermissions.some(
            (settingPermission) => settingPermission.setting === feature,
          ),
      }),
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
      settingsPermissions,
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
      settingsPermissions: {
        [SettingPermissionType.API_KEYS_AND_WEBHOOKS]: false,
        [SettingPermissionType.WORKSPACE]: false,
        [SettingPermissionType.WORKSPACE_MEMBERS]: false,
        [SettingPermissionType.ROLES]: false,
        [SettingPermissionType.DATA_MODEL]: false,
        [SettingPermissionType.ADMIN_PANEL]: false,
        [SettingPermissionType.SECURITY]: false,
        [SettingPermissionType.WORKFLOWS]: false,
      },
      objectPermissions: {},
    }) as const satisfies UserWorkspacePermissions;

  public async userHasWorkspaceSettingPermission({
    userWorkspaceId,
    workspaceId,
    setting,
    isExecutedByApiKey,
    apiKeyId,
  }: {
    userWorkspaceId?: string;
    workspaceId: string;
    setting: SettingPermissionType;
    isExecutedByApiKey: boolean;
    apiKeyId?: string;
  }): Promise<boolean> {
    let role: RoleEntity | null = null;

    if (isExecutedByApiKey && apiKeyId) {
      const roleId = await this.apiKeyRoleService.getRoleIdForApiKey(
        apiKeyId,
        workspaceId,
      );

      role = await this.roleRepository.findOne({
        where: { id: roleId, workspaceId },
        relations: ['settingPermissions'],
      });
    } else if (userWorkspaceId) {
      const [roleOfUserWorkspace] = await this.userRoleService
        .getRolesByUserWorkspaces({
          userWorkspaceIds: [userWorkspaceId],
          workspaceId,
        })
        .then((roles) => roles?.get(userWorkspaceId) ?? []);

      role = roleOfUserWorkspace;
    }

    if (!isDefined(role)) {
      throw new AuthException(
        'No role found for user or API key',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    if (role.canUpdateAllSettings === true) {
      return true;
    }

    const settingPermissions = role.settingPermissions ?? [];

    return settingPermissions.some(
      (settingPermission) => settingPermission.setting === setting,
    );
  }
}
