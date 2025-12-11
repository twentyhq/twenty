import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, In, Repository } from 'typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';

import { type UpsertPermissionFlagsInput } from 'src/engine/metadata-modules/permission-flag/dtos/upsert-permission-flag-input';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export class PermissionFlagService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
          userFriendlyMessage: msg`Some of the permissions you selected are not valid. Please try again with valid permission settings.`,
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
      if (queryRunner.isTransactionActive) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.trace(`Failed to rollback transaction: ${error.message}`);
        }
      }

      if (error.message.includes('violates foreign key constraint')) {
        const role = await this.roleRepository.findOne({
          where: { id: input.roleId },
        });

        if (!isDefined(role)) {
          throw new PermissionsException(
            PermissionsExceptionMessage.ROLE_NOT_FOUND,
            PermissionsExceptionCode.ROLE_NOT_FOUND,
            {
              userFriendlyMessage: msg`The role you are trying to modify could not be found. It may have been deleted or you may not have access to it.`,
            },
          );
        }
      }
      throw error;
    } finally {
      await queryRunner.release();

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'rolesPermissions',
      ]);
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
          userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
        },
      );
    }
  }
}
