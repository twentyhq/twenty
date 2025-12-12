import { Injectable, Logger } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { IsNull, Not, type EntityManager, type Repository } from 'typeorm';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { fromRoleEntityToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/from-role-entity-to-flat-role.util';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceRoleComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-role.comparator';
import { StandardRoleFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-role.factory';
import { STANDARD_ROLE_DEFINITIONS } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/standard-role-definitions';

@Injectable()
export class WorkspaceSyncRoleService {
  private readonly logger = new Logger(WorkspaceSyncRoleService.name);

  constructor(
    private readonly standardRoleFactory: StandardRoleFactory,
    private readonly workspaceRoleComparator: WorkspaceRoleComparator,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
  ): Promise<void> {
    this.logger.log('Syncing standard role metadata');

    const roleRepository = manager.getRepository(RoleEntity);
    const permissionFlagRepository =
      manager.getRepository(PermissionFlagEntity);

    const existingStandardRoleEntities = await roleRepository.find({
      where: {
        workspaceId: context.workspaceId,
        standardId: Not(IsNull()),
      },
      relations: [
        'permissionFlags',
        'roleTargets',
        'objectPermissions',
        'fieldPermissions',
      ],
    });

    const targetStandardRoles = this.standardRoleFactory.create(
      STANDARD_ROLE_DEFINITIONS,
      context,
      existingStandardRoleEntities,
    );

    const roleComparatorResults = this.workspaceRoleComparator.compare({
      fromFlatRoles: existingStandardRoleEntities.map(fromRoleEntityToFlatRole),
      toFlatRoles: targetStandardRoles,
    });

    for (const roleComparatorResult of roleComparatorResults) {
      switch (roleComparatorResult.action) {
        case ComparatorAction.CREATE: {
          const roleToCreate = roleComparatorResult.toFlatRole;

          const flatRoleData = removePropertiesFromRecord(roleToCreate, [
            'universalIdentifier',
            'id',
            'permissionFlagIds',
            'fieldPermissionIds',
            'objectPermissionIds',
            'roleTargetIds',
          ]);

          const createdRole = await roleRepository.save({
            ...flatRoleData,
            workspaceId: context.workspaceId,
          });

          const roleDefinition = STANDARD_ROLE_DEFINITIONS.find(
            (def) => def.standardId === roleToCreate.standardId,
          );

          if (roleDefinition?.permissionFlags?.length) {
            await this.syncPermissionFlags(
              permissionFlagRepository,
              createdRole.id,
              context.workspaceId,
              roleDefinition.permissionFlags,
            );
          }
          break;
        }

        case ComparatorAction.UPDATE: {
          const roleToUpdate = roleComparatorResult.toFlatRole;

          const flatRoleData = removePropertiesFromRecord(roleToUpdate, [
            'id',
            'universalIdentifier',
            'workspaceId',
            'permissionFlagIds',
            'fieldPermissionIds',
            'objectPermissionIds',
            'roleTargetIds',
          ]);

          await roleRepository.update({ id: roleToUpdate.id }, flatRoleData);

          const roleDefinition = STANDARD_ROLE_DEFINITIONS.find(
            (def) => def.standardId === roleToUpdate.standardId,
          );

          if (roleDefinition?.permissionFlags) {
            await this.syncPermissionFlags(
              permissionFlagRepository,
              roleToUpdate.id,
              context.workspaceId,
              roleDefinition.permissionFlags,
            );
          }
          break;
        }

        case ComparatorAction.DELETE: {
          const roleToDelete = roleComparatorResult.fromFlatRole;

          await roleRepository.delete({ id: roleToDelete.id });
          break;
        }
      }
    }
  }

  private async syncPermissionFlags(
    permissionFlagRepository: Repository<PermissionFlagEntity>,
    roleId: string,
    workspaceId: string,
    permissionFlags: PermissionFlagType[],
  ): Promise<void> {
    await permissionFlagRepository.delete({
      roleId,
      workspaceId,
    });

    if (permissionFlags.length > 0) {
      const newPermissionFlags = permissionFlags.map((flag) =>
        permissionFlagRepository.create({
          roleId,
          workspaceId,
          flag,
        }),
      );

      await permissionFlagRepository.save(newPermissionFlags);
    }
  }
}
