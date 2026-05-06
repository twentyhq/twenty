import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import {
  FlatDeleteConnectionProviderAction,
  UniversalDeleteConnectionProviderAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/connection-provider/types/workspace-migration-connection-provider-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteConnectionProviderActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'connectionProvider',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteConnectionProviderAction>,
  ): Promise<FlatDeleteConnectionProviderAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteConnectionProviderAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const connectionProviderRepository =
      queryRunner.manager.getRepository<ConnectionProviderEntity>(
        ConnectionProviderEntity,
      );

    await connectionProviderRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteConnectionProviderAction>,
  ): Promise<void> {
    return;
  }
}
