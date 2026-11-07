import { Injectable } from '@nestjs/common';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

@Injectable()
export class NavigationMenuItemAccessService {
  constructor(
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  async canUserCreateNavigationMenuItem({
    userWorkspaceId,
    inputUserWorkspaceId,
  }: {
    userWorkspaceId: string | undefined;
    inputUserWorkspaceId: string | undefined;
  }): Promise<boolean> {
    if (!isDefined(inputUserWorkspaceId)) {
      const hasPermission =
        await this.settingPermissionsService.hasPermissionFlag({
          authContext: workspaceAuthContextStorage.getStore(),
          permissionFlag: PermissionFlagType.LAYOUTS,
        });

      if (!hasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage: msg`You do not have permission to create workspace-level navigation menu items. Please contact your workspace administrator for access.`,
          },
        );
      }

      return true;
    }

    if (!isDefined(userWorkspaceId)) {
      throw new NavigationMenuItemException(
        'User-level navigation menu items can only be created by authenticated users',
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    }

    return true;
  }

  async canUserUpdateNavigationMenuItem({
    userWorkspaceId,
    existingUserWorkspaceId,
  }: {
    userWorkspaceId: string | undefined;
    existingUserWorkspaceId: string | null | undefined;
  }): Promise<boolean> {
    if (!isDefined(existingUserWorkspaceId)) {
      const hasPermission =
        await this.settingPermissionsService.hasPermissionFlag({
          authContext: workspaceAuthContextStorage.getStore(),
          permissionFlag: PermissionFlagType.LAYOUTS,
        });

      if (!hasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage: msg`You do not have permission to update workspace-level navigation menu items. Please contact your workspace administrator for access.`,
          },
        );
      }

      return true;
    }

    if (!isDefined(userWorkspaceId)) {
      throw new NavigationMenuItemException(
        'User-level navigation menu items can only be updated by authenticated users',
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    }

    if (existingUserWorkspaceId !== userWorkspaceId) {
      throw new NavigationMenuItemException(
        'You can only update your own navigation menu items',
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    }

    return true;
  }

  async canUserDeleteNavigationMenuItem({
    userWorkspaceId,
    existingUserWorkspaceId,
  }: {
    userWorkspaceId: string | undefined;
    existingUserWorkspaceId: string | null | undefined;
  }): Promise<boolean> {
    if (!isDefined(existingUserWorkspaceId)) {
      const hasPermission =
        await this.settingPermissionsService.hasPermissionFlag({
          authContext: workspaceAuthContextStorage.getStore(),
          permissionFlag: PermissionFlagType.LAYOUTS,
        });

      if (!hasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage: msg`You do not have permission to delete workspace-level navigation menu items. Please contact your workspace administrator for access.`,
          },
        );
      }

      return true;
    }

    if (!isDefined(userWorkspaceId)) {
      throw new NavigationMenuItemException(
        'User-level navigation menu items can only be deleted by authenticated users',
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    }

    if (existingUserWorkspaceId !== userWorkspaceId) {
      throw new NavigationMenuItemException(
        'You can only delete your own navigation menu items',
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    }

    return true;
  }
}
