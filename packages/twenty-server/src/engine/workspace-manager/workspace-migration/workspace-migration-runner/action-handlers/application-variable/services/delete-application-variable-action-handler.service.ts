import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import {
  FlatDeleteApplicationVariableAction,
  UniversalDeleteApplicationVariableAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/application-variable/types/workspace-migration-application-variable-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteApplicationVariableActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'applicationVariable',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteApplicationVariableAction>,
  ): Promise<FlatDeleteApplicationVariableAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteApplicationVariableAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const applicationVariableRepository =
      queryRunner.manager.getRepository<ApplicationVariableEntity>(
        ApplicationVariableEntity,
      );

    await applicationVariableRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteApplicationVariableAction>,
  ): Promise<void> {
    return;
  }
}
