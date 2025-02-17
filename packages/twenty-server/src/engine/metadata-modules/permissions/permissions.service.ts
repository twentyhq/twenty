import { Injectable } from '@nestjs/common';

import { PermissionsOnAllObjectRecords, SettingsFeatures } from 'twenty-shared';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly userRoleService: UserRoleService,
  ) {}

  public async getUserWorkspacePermissions({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<{
    settingsPermissions: Record<SettingsFeatures, boolean>;
    objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>;
  }> {
    const [roleOfUserWorkspace] = await this.userRoleService
      .getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId,
      })
      .then((roles) => roles?.get(userWorkspaceId) ?? []);

    let hasPermissionOnSettingFeature = false;

    if (roleOfUserWorkspace?.canUpdateAllSettings === true) {
      hasPermissionOnSettingFeature = true;
    }

    const settingsPermissionsMap = Object.keys(SettingsFeatures).reduce(
      (acc, feature) => ({
        ...acc,
        [feature]: hasPermissionOnSettingFeature,
      }),
      {} as Record<SettingsFeatures, boolean>,
    );

    const objectRecordsPermissionsMap: Record<
      PermissionsOnAllObjectRecords,
      boolean
    > = {
      [PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS]:
        roleOfUserWorkspace?.canReadAllObjectRecords ?? false,
      [PermissionsOnAllObjectRecords.UPDATE_ALL_OBJECT_RECORDS]:
        roleOfUserWorkspace?.canUpdateAllObjectRecords ?? false,
      [PermissionsOnAllObjectRecords.SOFT_DELETE_ALL_OBJECT_RECORDS]:
        roleOfUserWorkspace?.canSoftDeleteAllObjectRecords ?? false,
      [PermissionsOnAllObjectRecords.DESTROY_ALL_OBJECT_RECORDS]:
        roleOfUserWorkspace?.canDestroyAllObjectRecords ?? false,
    };

    return {
      settingsPermissions: settingsPermissionsMap,
      objectRecordsPermissions: objectRecordsPermissionsMap,
    };
  }

  public async userHasWorkspaceSettingPermission({
    userWorkspaceId,
    workspaceId,
    _setting,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
    _setting: SettingsFeatures;
  }): Promise<boolean> {
    const [roleOfUserWorkspace] = await this.userRoleService
      .getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId,
      })
      .then((roles) => roles?.get(userWorkspaceId) ?? []);

    if (roleOfUserWorkspace?.canUpdateAllSettings === true) {
      return true;
    }

    return false;
  }

  public async isPermissionsEnabled(): Promise<boolean> {
    return this.environmentService.get('PERMISSIONS_ENABLED') === true;
  }
}
