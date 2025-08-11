import { Injectable, Logger } from '@nestjs/common';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { IsNull, Not, type EntityManager } from 'typeorm';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { fromRoleEntityToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/from-role-entity-to-flat-role.util';
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
    this.logger.log('Syncing standard role metadata');

    const roleRepository = manager.getRepository(RoleEntity);

    const existingStandardRoleEntities = await roleRepository.find({
      where: {
        workspaceId: context.workspaceId,
        standardId: Not(IsNull()),
      },
    });

    const targetStandardRoles = this.standardRoleFactory.create(
      standardRoleDefinitions,
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
            'uniqueIdentifier',
            'id',
          ]);

          await roleRepository.save({
            ...flatRoleData,
            workspaceId: context.workspaceId,
          });
          break;
        }

        case ComparatorAction.UPDATE: {
          const roleToUpdate = roleComparatorResult.toFlatRole;

          const flatRoleData = removePropertiesFromRecord(roleToUpdate, [
            'id',
            'uniqueIdentifier',
            'workspaceId',
          ]);

          await roleRepository.update({ id: roleToUpdate.id }, flatRoleData);
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
}
