import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { FlatCreateFrontComponentAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateFrontComponentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'frontComponent',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreateFrontComponentAction>,
  ): Promise<FlatCreateFrontComponentAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateFrontComponentAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const frontComponentRepository =
      queryRunner.manager.getRepository<FrontComponentEntity>(
        FrontComponentEntity,
      );

    await frontComponentRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateFrontComponentAction>,
  ): Promise<void> {
    return;
  }
}
