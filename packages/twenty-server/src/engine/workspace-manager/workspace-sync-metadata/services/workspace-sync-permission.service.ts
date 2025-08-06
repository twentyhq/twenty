import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-permission.comparator';
import { StandardPermissionFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-permission.factory';
import { standardRoleDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-permissions';

@Injectable()
export class WorkspaceSyncPermissionService {
  private readonly logger = new Logger(WorkspaceSyncPermissionService.name);

  constructor(
    private readonly standardPermissionFactory: StandardPermissionFactory,
    private readonly workspacePermissionComparator: WorkspacePermissionComparator,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
  ): Promise<void> {
    this.logger.log('Syncing permission metadata');

    const roleRepository = manager.getRepository(RoleEntity);

    const originalRoleCollection = await roleRepository.find({
      where: { workspaceId: context.workspaceId },
      relations: ['permissionFlags'],
    });

    const standardPermissionMetadataCollection =
      this.standardPermissionFactory.create(
        standardRoleDefinitions,
        context,
        originalRoleCollection,
      );

    const permissionComparatorResults =
      this.workspacePermissionComparator.compare(
        standardPermissionMetadataCollection,
        originalRoleCollection,
      );

    for (const permissionComparatorResult of permissionComparatorResults) {
      if (permissionComparatorResult.action === 'CREATE') {
        await roleRepository.save({
          label: permissionComparatorResult.object.label,
          description: permissionComparatorResult.object.description,
          icon: permissionComparatorResult.object.icon,
          isEditable: permissionComparatorResult.object.isEditable,
          canUpdateAllSettings:
            permissionComparatorResult.object.canUpdateAllSettings,
          canAccessAllTools:
            permissionComparatorResult.object.canAccessAllTools,
          canReadAllObjectRecords:
            permissionComparatorResult.object.canReadAllObjectRecords,
          canUpdateAllObjectRecords:
            permissionComparatorResult.object.canUpdateAllObjectRecords,
          canSoftDeleteAllObjectRecords:
            permissionComparatorResult.object.canSoftDeleteAllObjectRecords,
          canDestroyAllObjectRecords:
            permissionComparatorResult.object.canDestroyAllObjectRecords,
          workspaceId: context.workspaceId,
        });
      } else if (permissionComparatorResult.action === 'UPDATE') {
        const existingRole = originalRoleCollection.find(
          (role) => role.label === permissionComparatorResult.object.label,
        );

        if (existingRole) {
          await roleRepository.update(existingRole.id, {
            description: permissionComparatorResult.object.description,
            icon: permissionComparatorResult.object.icon,
            isEditable: permissionComparatorResult.object.isEditable,
            canUpdateAllSettings:
              permissionComparatorResult.object.canUpdateAllSettings,
            canAccessAllTools:
              permissionComparatorResult.object.canAccessAllTools,
            canReadAllObjectRecords:
              permissionComparatorResult.object.canReadAllObjectRecords,
            canUpdateAllObjectRecords:
              permissionComparatorResult.object.canUpdateAllObjectRecords,
            canSoftDeleteAllObjectRecords:
              permissionComparatorResult.object.canSoftDeleteAllObjectRecords,
            canDestroyAllObjectRecords:
              permissionComparatorResult.object.canDestroyAllObjectRecords,
          });
        }
      }
    }
  }
}
