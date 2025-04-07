import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { SettingPermissionEntity } from 'src/engine/metadata-modules/setting-permission/setting-permission.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly userRoleService: UserRoleService,
    @InjectRepository(SettingPermissionEntity, 'metadata')
    private readonly settingPermissionRepository: Repository<SettingPermissionEntity>,
  ) {}

  public async getUserWorkspacePermissions({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<{
    settingsPermissions: Record<SettingPermissionType, boolean>;
    objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>;
  }> {
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

    const settingPermissions = await this.settingPermissionRepository.find({
      where: {
        roleId: roleOfUserWorkspace.id,
      },
    });

    const settingsPermissionsMap = Object.keys(SettingPermissionType).reduce(
      (acc, feature) => ({
        ...acc,
        [feature]:
          hasPermissionOnSettingFeature ||
          settingPermissions.some(
            (settingPermission) => settingPermission.setting === feature,
          ),
      }),
      {} as Record<SettingPermissionType, boolean>,
    );

    const objectRecordsPermissionsMap: Record<
      PermissionsOnAllObjectRecords,
      boolean
    > = {
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
      settingsPermissions: settingsPermissionsMap,
      objectRecordsPermissions: objectRecordsPermissionsMap,
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

    const settingPermissions = await this.settingPermissionRepository.findOne({
      where: {
        roleId: roleOfUserWorkspace.id,
        setting,
      },
    });

    return isDefined(settingPermissions);
  }

  public async userHasObjectRecordsPermission({
    userWorkspaceId,
    workspaceId,
    requiredPermission,
    isExecutedByApiKey,
  }: {
    userWorkspaceId?: string;
    workspaceId: string;
    requiredPermission: PermissionsOnAllObjectRecords;
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

    const roleColumn =
      this.getRoleColumnForRequiredPermission(requiredPermission);

    return roleOfUserWorkspace?.[roleColumn] === true;
  }

  private getRoleColumnForRequiredPermission(
    requiredPermission: PermissionsOnAllObjectRecords,
  ): keyof RoleEntity {
    switch (requiredPermission) {
      case PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS:
        return 'canReadAllObjectRecords';
      case PermissionsOnAllObjectRecords.UPDATE_ALL_OBJECT_RECORDS:
        return 'canUpdateAllObjectRecords';
      case PermissionsOnAllObjectRecords.SOFT_DELETE_ALL_OBJECT_RECORDS:
        return 'canSoftDeleteAllObjectRecords';
      case PermissionsOnAllObjectRecords.DESTROY_ALL_OBJECT_RECORDS:
        return 'canDestroyAllObjectRecords';
      default:
        throw new PermissionsException(
          PermissionsExceptionMessage.UNKNOWN_REQUIRED_PERMISSION,
          PermissionsExceptionCode.UNKNOWN_REQUIRED_PERMISSION,
        );
    }
  }
}
