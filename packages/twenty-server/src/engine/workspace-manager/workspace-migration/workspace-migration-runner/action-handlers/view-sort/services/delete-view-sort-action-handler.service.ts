import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { DeleteViewSortAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-sort/types/workspace-migration-view-sort-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';

@Injectable()
export class DeleteViewSortActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'viewSort',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteViewSortAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatViewSort = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatViewSortMaps,
      universalIdentifier,
    });

    const viewSortRepository =
      queryRunner.manager.getRepository<ViewSortEntity>(ViewSortEntity);

    await viewSortRepository.delete({
      id: flatViewSort.id,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteViewSortAction>,
  ): Promise<void> {
    return;
  }
}
