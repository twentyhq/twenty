import { Injectable, Logger } from '@nestjs/common';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { EntityManager } from 'typeorm';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceRoleComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-role.comparator';
import { StandardRoleFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-role.factory';
import { standardRoleDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles';

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

    const standardRoleMetadataCollection = this.standardRoleFactory.create(
      standardRoleDefinitions,
      context,
      originalRoleCollection,
    );

    const roleComparatorResults = this.workspaceRoleComparator.compare(
      standardRoleMetadataCollection,
      originalRoleCollection,
    );

    for (const roleComparatorResult of roleComparatorResults) {
      if (roleComparatorResult.action === ComparatorAction.CREATE) {
        const roleToCreate = roleComparatorResult.object;

        const flatRoleData = removePropertiesFromRecord(roleToCreate, [
          'uniqueIdentifier',
          'id',
        ]);

        await roleRepository.save({
          ...flatRoleData,
          workspaceId: context.workspaceId,
        });
      }

      if (roleComparatorResult.action === ComparatorAction.UPDATE) {
        const roleToUpdate = roleComparatorResult.object;

        const flatRoleData = removePropertiesFromRecord(roleToUpdate, [
          'id',
          'uniqueIdentifier',
          'workspaceId',
        ]);

        await roleRepository.update({ id: roleToUpdate.id }, flatRoleData);
      }

      if (roleComparatorResult.action === ComparatorAction.DELETE) {
        const roleToDelete = roleComparatorResult.object;

        await roleRepository.delete({ id: roleToDelete.id });
      }
    }
  }
}
