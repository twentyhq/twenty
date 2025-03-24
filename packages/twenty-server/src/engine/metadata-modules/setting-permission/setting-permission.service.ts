import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared';
import { Repository } from 'typeorm';

import { SettingsPermissions } from 'src/engine/metadata-modules/permissions/constants/settings-permissions.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UpsertSettingPermissionInput } from 'src/engine/metadata-modules/setting-permission/dtos/upsert-setting-permission-input';
import { SettingPermissionEntity } from 'src/engine/metadata-modules/setting-permission/setting-permission.entity';

export class SettingPermissionService {
  constructor(
    @InjectRepository(SettingPermissionEntity, 'metadata')
    private readonly settingPermissionRepository: Repository<SettingPermissionEntity>,
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  public async upsertSettingPermission({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertSettingPermissionInput;
  }): Promise<SettingPermissionEntity | null | undefined> {
    if (!Object.values(SettingsPermissions).includes(input.setting)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.INVALID_SETTING,
        PermissionsExceptionCode.INVALID_SETTING,
      );
    }

    try {
      const result = await this.settingPermissionRepository.upsert(
        {
          workspaceId,
          ...input,
        },
        {
          conflictPaths: ['setting', 'roleId'],
        },
      );

      const settingPermissionId = result.generatedMaps?.[0]?.id;

      if (!isDefined(settingPermissionId)) {
        throw new Error('Failed to upsert setting permission');
      }

      return this.settingPermissionRepository.findOne({
        where: {
          id: settingPermissionId,
        },
      });
    } catch (error) {
      if (error.message.includes('violates foreign key constraint')) {
        const role = await this.roleRepository.findOne({
          where: {
            id: input.roleId,
          },
        });

        if (!isDefined(role)) {
          throw new PermissionsException(
            PermissionsExceptionMessage.ROLE_NOT_FOUND,
            PermissionsExceptionCode.ROLE_NOT_FOUND,
          );
        }
      }

      throw error;
    }
  }
}
