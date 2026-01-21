import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { DeleteViewGroupAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/types/workspace-migration-view-group-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'viewGroup',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteViewGroupAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatViewGroup = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatViewGroupMaps,
      universalIdentifier,
    });

    const viewGroupRepository =
      queryRunner.manager.getRepository<ViewGroupEntity>(ViewGroupEntity);

    await viewGroupRepository.delete({
      id: flatViewGroup.id,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteViewGroupAction>,
  ): Promise<void> {
    return;
  }
}
