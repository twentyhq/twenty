import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { FlatUpdateFrontComponentAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateFrontComponentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'frontComponent',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateFrontComponentAction>,
  ): Promise<FlatUpdateFrontComponentAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateFrontComponentAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const frontComponentRepository =
      queryRunner.manager.getRepository<FrontComponentEntity>(
        FrontComponentEntity,
      );

    await frontComponentRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateFrontComponentAction>,
  ): Promise<void> {
    return;
  }
}
