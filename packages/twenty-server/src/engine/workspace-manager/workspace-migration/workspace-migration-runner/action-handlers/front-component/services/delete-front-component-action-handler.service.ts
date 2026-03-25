import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import {
  FlatDeleteFrontComponentAction,
  UniversalDeleteFrontComponentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteFrontComponentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'frontComponent',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteFrontComponentAction>,
  ): Promise<FlatDeleteFrontComponentAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteFrontComponentAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const frontComponentRepository =
      queryRunner.manager.getRepository<FrontComponentEntity>(
        FrontComponentEntity,
      );

    await frontComponentRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteFrontComponentAction>,
  ): Promise<void> {
    return;
  }
}
