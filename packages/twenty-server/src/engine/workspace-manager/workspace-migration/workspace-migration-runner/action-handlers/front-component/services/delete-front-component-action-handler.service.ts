import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { DeleteFrontComponentAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteFrontComponentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'frontComponent',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteFrontComponentAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatFrontComponent = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatFrontComponentMaps,
      universalIdentifier,
    });

    const frontComponentRepository =
      queryRunner.manager.getRepository<FrontComponentEntity>(
        FrontComponentEntity,
      );

    await frontComponentRepository.delete({
      id: flatFrontComponent.id,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteFrontComponentAction>,
  ): Promise<void> {
    return;
  }
}
