import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import {
  FlatUpdateViewSortAction,
  UniversalUpdateViewSortAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-sort/types/workspace-migration-view-sort-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';

@Injectable()
export class UpdateViewSortActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'viewSort',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateViewSortAction>,
  ): Promise<FlatUpdateViewSortAction> {
    const { action, allFlatEntityMaps } = context;

    const flatViewSort = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatViewSortMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'viewSort',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'viewSort',
      entityId: flatViewSort.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewSortAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const viewSortRepository =
      queryRunner.manager.getRepository<ViewSortEntity>(ViewSortEntity);

    await viewSortRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewSortAction>,
  ): Promise<void> {
    return;
  }
}
