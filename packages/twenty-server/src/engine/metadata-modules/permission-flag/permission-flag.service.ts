import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, In, Repository } from 'typeorm';

import { UpsertPermissionFlagsInput } from 'src/engine/metadata-modules/permission-flag/dtos/upsert-permission-flag-input';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

export class PermissionFlagService {
  constructor(
    @InjectRepository(PermissionFlagEntity, 'core')
    private readonly permissionFlagRepository: Repository<PermissionFlagEntity>,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectDataSource('core')
    private readonly coreDataSource: DataSource,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  public async upsertPermissionFlags({
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

    const invalidFlags = input.permissionFlagKeys.filter(
      (flag) => !Object.values(PermissionFlagType).includes(flag),
    );

    if (invalidFlags.length > 0) {
      throw new PermissionsException(
        `${PermissionsExceptionMessage.INVALID_SETTING}: ${invalidFlags.join(', ')}`,
        PermissionsExceptionCode.INVALID_SETTING,
        {
          userFriendlyMessage:
            'Some of the permissions you selected are not valid. Please try again with valid permission settings.',
        },
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
      const existingSettings = new Set(existingPermissions.map((p) => p.flag));
      const inputSettings = new Set(input.permissionFlagKeys);

      const flagsToAdd = input.permissionFlagKeys.filter(
        (setting) => !existingSettings.has(setting),
      );
      const permissionsToRemove = existingPermissions.filter(
        (permission) => !inputSettings.has(permission.flag),
      );

      if (permissionsToRemove.length > 0) {
        await queryRunner.manager.delete(PermissionFlagEntity, {
          id: In(permissionsToRemove.map((p) => p.id)),
        });
      }

      if (flagsToAdd.length > 0) {
        const newPermissions = flagsToAdd.map((flag) =>
          queryRunner.manager.create(PermissionFlagEntity, {
            workspaceId,
            roleId: input.roleId,
            flag,
          }),
        );

        await queryRunner.manager.save(PermissionFlagEntity, newPermissions);
      }

      await queryRunner.commitTransaction();

      return queryRunner.manager.find(PermissionFlagEntity, {
        where: { roleId: input.roleId, workspaceId },
        order: { flag: 'ASC' },
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
            {
              userFriendlyMessage:
                'The role you are trying to modify could not be found. It may have been deleted or you may not have access to it.',
            },
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
        {
          userFriendlyMessage:
            'This role cannot be modified because it is a system role. Only custom roles can be edited.',
        },
      );
    }
  }
}
