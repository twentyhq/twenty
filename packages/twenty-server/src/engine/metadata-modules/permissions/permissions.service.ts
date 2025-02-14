import { Injectable } from '@nestjs/common';

import { SettingsFeatures } from 'twenty-shared';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly userRoleService: UserRoleService,
  ) {}

  public async getUserWorkspaceSettingsPermissions({
    userWorkspaceId,
  }: {
    userWorkspaceId: string;
  }): Promise<Record<SettingsFeatures, boolean>> {
    const [roleOfUserWorkspace] = await this.userRoleService
      .getRolesByUserWorkspaces([userWorkspaceId])
      .then((roles) => roles?.get(userWorkspaceId) ?? []);

    let hasPermissionOnSettingFeature = false;

    if (roleOfUserWorkspace?.canUpdateAllSettings === true) {
      hasPermissionOnSettingFeature = true;
    }

    return Object.keys(SettingsFeatures).reduce(
      (acc, feature) => ({
        ...acc,
        [feature]: hasPermissionOnSettingFeature,
      }),
      {} as Record<SettingsFeatures, boolean>,
    );
  }

  public async userHasWorkspaceSettingPermission({
    userWorkspaceId,
    _setting,
  }: {
    userWorkspaceId: string;
    _setting: SettingsFeatures;
  }): Promise<boolean> {
    const [roleOfUserWorkspace] = await this.userRoleService
      .getRolesByUserWorkspaces([userWorkspaceId])
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
