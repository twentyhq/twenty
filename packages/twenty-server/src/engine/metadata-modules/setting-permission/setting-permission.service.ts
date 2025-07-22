import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, In, Repository } from 'typeorm';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UpsertPermissionFlagsInput } from 'src/engine/metadata-modules/setting-permission/dtos/upsert-permission-flag-input';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/setting-permission/permission-flag.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

export class SettingPermissionService {
  constructor(
    @InjectRepository(PermissionFlagEntity, 'core')
    private readonly settingPermissionRepository: Repository<PermissionFlagEntity>,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectDataSource('core')
    private readonly coreDataSource: DataSource,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  public async upsertSettingPermissions({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertPermissionFlagsInput;
  }): Promise<PermissionFlagEntity[]> {
    await this.validateRoleIsEditableOrThrow({
      roleId: input.roleId,
      workspaceId,
    });

    const invalidSettings = input.settingPermissionKeys.filter(
      (setting) => !Object.values(PermissionFlagType).includes(setting),
    );

    if (invalidSettings.length > 0) {
      throw new PermissionsException(
        `${PermissionsExceptionMessage.INVALID_SETTING}: ${invalidSettings.join(', ')}`,
        PermissionsExceptionCode.INVALID_SETTING,
      );
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingPermissions = await queryRunner.manager.find(
        PermissionFlagEntity,
        {
          where: {
            roleId: input.roleId,
            workspaceId,
          },
        },
      );
      const existingSettings = new Set(
        existingPermissions.map((p) => p.permissionFlag),
      );
      const inputSettings = new Set(input.settingPermissionKeys);

      const settingsToAdd = input.settingPermissionKeys.filter(
        (setting) => !existingSettings.has(setting),
      );
      const permissionsToRemove = existingPermissions.filter(
        (permission) => !inputSettings.has(permission.permissionFlag),
      );

      if (permissionsToRemove.length > 0) {
        await queryRunner.manager.delete(PermissionFlagEntity, {
          id: In(permissionsToRemove.map((p) => p.id)),
        });
      }

      if (settingsToAdd.length > 0) {
        const newPermissions = settingsToAdd.map((setting) =>
          queryRunner.manager.create(PermissionFlagEntity, {
            workspaceId,
            roleId: input.roleId,
            setting,
          }),
        );

        await queryRunner.manager.save(PermissionFlagEntity, newPermissions);
      }

      await queryRunner.commitTransaction();

      return queryRunner.manager.find(PermissionFlagEntity, {
        where: { roleId: input.roleId, workspaceId },
        order: { permissionFlag: 'ASC' },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error.message.includes('violates foreign key constraint')) {
        const role = await this.roleRepository.findOne({
          where: { id: input.roleId },
        });

        if (!isDefined(role)) {
          throw new PermissionsException(
            PermissionsExceptionMessage.ROLE_NOT_FOUND,
            PermissionsExceptionCode.ROLE_NOT_FOUND,
          );
        }
      }
      throw error;
    } finally {
      await queryRunner.release();

      await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache(
        {
          workspaceId,
          roleIds: [input.roleId],
        },
      );
    }
  }

  private async validateRoleIsEditableOrThrow({
    roleId,
    workspaceId,
  }: {
    roleId: string;
    workspaceId: string;
  }) {
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
        workspaceId,
      },
    });

    if (!role?.isEditable) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
        PermissionsExceptionCode.ROLE_NOT_EDITABLE,
      );
    }
  }
}
