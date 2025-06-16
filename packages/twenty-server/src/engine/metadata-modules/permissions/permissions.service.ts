import { Injectable } from '@nestjs/common';

import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  public async getUserWorkspacePermissionsV2({
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
      objectPermissions: {},
    };
  }

  public async userHasWorkspaceSettingPermission({
    userWorkspaceId,
    workspaceId,
    setting,
    isExecutedByApiKey,
  }: {
    userWorkspaceId?: string;
    workspaceId: string;
    setting: SettingPermissionType;
    isExecutedByApiKey: boolean;
  }): Promise<boolean> {
    if (isExecutedByApiKey) {
      return true;
    }

    if (!isDefined(userWorkspaceId)) {
      throw new AuthException(
        'Missing userWorkspaceId or apiKey in authContext',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

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
      );
    }

    if (roleOfUserWorkspace.canUpdateAllSettings === true) {
      return true;
    }

    const isPermissionsV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_PERMISSIONS_V2_ENABLED,
        workspaceId,
      );

    if (isPermissionsV2Enabled) {
      const settingPermissions = roleOfUserWorkspace.settingPermissions ?? [];

      return settingPermissions.some(
        (settingPermission) => settingPermission.setting === setting,
      );
    } else {
      return false;
    }
  }

  public async userHasObjectRecordsPermission({
    userWorkspaceId,
    workspaceId,
    requiredPermission,
    isExecutedByApiKey,
    objectMetadataId,
  }: {
    userWorkspaceId?: string;
    workspaceId: string;
    requiredPermission: PermissionsOnAllObjectRecords;
    isExecutedByApiKey: boolean;
    objectMetadataId: string;
  }): Promise<boolean> {
    const isPermissionsV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_PERMISSIONS_V2_ENABLED,
        workspaceId,
      );

    if (isPermissionsV2Enabled) {
      throw new Error(
        'This should not be called once Permissions V2 is enabled',
      );
    }

    if (isExecutedByApiKey) {
      return true;
    }

    if (!isDefined(userWorkspaceId)) {
      throw new AuthException(
        'Missing userWorkspaceId or apiKey in authContext',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const roleIdOfUserWorkspace =
      await this.userRoleService.getRoleIdForUserWorkspace({
        userWorkspaceId,
        workspaceId,
      });

    if (!isDefined(roleIdOfUserWorkspace)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      );
    }

    const { data: rolesPermissions } =
      await this.workspacePermissionsCacheService.getRolesPermissionsFromCache({
        workspaceId,
      });

    const rolePermissionsForUserWorkspaceRole =
      rolesPermissions[roleIdOfUserWorkspace];

    const objectPermissionKey =
      this.getObjectPermissionKeyForRequiredPermission(requiredPermission);

    const objectPermissionValue =
      rolePermissionsForUserWorkspaceRole[objectMetadataId]?.[
        objectPermissionKey
      ];

    return objectPermissionValue === true;
  }

  private getObjectPermissionKeyForRequiredPermission(
    requiredPermission: PermissionsOnAllObjectRecords,
  ) {
    switch (requiredPermission) {
      case PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS:
        return 'canRead';
      case PermissionsOnAllObjectRecords.UPDATE_ALL_OBJECT_RECORDS:
        return 'canUpdate';
      case PermissionsOnAllObjectRecords.SOFT_DELETE_ALL_OBJECT_RECORDS:
        return 'canSoftDelete';
      case PermissionsOnAllObjectRecords.DESTROY_ALL_OBJECT_RECORDS:
        return 'canDestroy';
      default:
        throw new PermissionsException(
          PermissionsExceptionMessage.UNKNOWN_REQUIRED_PERMISSION,
          PermissionsExceptionCode.UNKNOWN_REQUIRED_PERMISSION,
        );
    }
  }
}
