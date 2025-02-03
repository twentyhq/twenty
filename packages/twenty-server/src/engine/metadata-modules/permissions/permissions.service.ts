import { Injectable } from '@nestjs/common';

import { SettingsFeatures } from 'twenty-shared';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/userRole/userRole.service';

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
    const roleOfUserWorkspace =
      await this.userRoleService.getRoleForUserWorkspace(userWorkspaceId);

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

  public async validateUserHasWorkspaceSettingPermissionOrThrow({
    userWorkspaceId,
    setting,
  }: {
    userWorkspaceId: string;
    setting: SettingsFeatures;
  }): Promise<void> {
    const userWorkspaceRole =
      await this.userRoleService.getRoleForUserWorkspace(userWorkspaceId);

    if (userWorkspaceRole?.canUpdateAllSettings === true) {
      return;
    }

    throw new PermissionsException(
      `User does not have permission to update this setting: ${setting}`,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  public async isPermissionsEnabled(): Promise<boolean> {
    return this.environmentService.get('PERMISSIONS_ENABLED') === true;
  }
}
