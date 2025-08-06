import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceRoleComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-role.comparator';
import { StandardRoleFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-role.factory';
import { standardRoleDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles';
import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/comparator-action.enum';

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
    this.logger.log('Syncing role metadata');

    const roleRepository = manager.getRepository(RoleEntity);

    const originalRoleCollection = await roleRepository.find({
      where: { workspaceId: context.workspaceId },
      relations: ['permissionFlags'],
    });

    const standardRoleMetadataCollection =
      this.standardRoleFactory.create(
        standardRoleDefinitions,
        context,
        originalRoleCollection,
      );

    const roleComparatorResults =
      this.workspaceRoleComparator.compare(
        standardRoleMetadataCollection,
        originalRoleCollection,
      );

    for (const roleComparatorResult of roleComparatorResults) {
      if (roleComparatorResult.action === ComparatorAction.CREATE) {
        const roleToCreate = roleComparatorResult.object;

        await roleRepository.save({
          label: roleToCreate.label,
          description: roleToCreate.description,
          icon: roleToCreate.icon,
          isEditable: roleToCreate.isEditable,
          canUpdateAllSettings: roleToCreate.canUpdateAllSettings,
          canAccessAllTools: roleToCreate.canAccessAllTools,
          canReadAllObjectRecords: roleToCreate.canReadAllObjectRecords,
          canUpdateAllObjectRecords: roleToCreate.canUpdateAllObjectRecords,
          canSoftDeleteAllObjectRecords: roleToCreate.canSoftDeleteAllObjectRecords,
          canDestroyAllObjectRecords: roleToCreate.canDestroyAllObjectRecords,
          workspaceId: context.workspaceId,
        });
      }

      if (roleComparatorResult.action === ComparatorAction.UPDATE) {
        const roleToUpdate = roleComparatorResult.object;

        await roleRepository.update(
          { id: roleToUpdate.roleId },
          {
            label: roleToUpdate.label,
            description: roleToUpdate.description,
            icon: roleToUpdate.icon,
            isEditable: roleToUpdate.isEditable,
            canUpdateAllSettings: roleToUpdate.canUpdateAllSettings,
            canAccessAllTools: roleToUpdate.canAccessAllTools,
            canReadAllObjectRecords: roleToUpdate.canReadAllObjectRecords,
            canUpdateAllObjectRecords: roleToUpdate.canUpdateAllObjectRecords,
            canSoftDeleteAllObjectRecords: roleToUpdate.canSoftDeleteAllObjectRecords,
            canDestroyAllObjectRecords: roleToUpdate.canDestroyAllObjectRecords,
          },
        );
      }
    }
  }
}
