import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { MessagingProviderEntity } from 'src/engine/metadata-modules/messaging-provider/entities/messaging-provider.entity';
import {
  FlatDeleteMessagingProviderAction,
  UniversalDeleteMessagingProviderAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/messaging-provider/types/workspace-migration-messaging-provider-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteMessagingProviderActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'messagingProvider',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteMessagingProviderAction>,
  ): Promise<FlatDeleteMessagingProviderAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteMessagingProviderAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const messagingProviderRepository =
      queryRunner.manager.getRepository<MessagingProviderEntity>(
        MessagingProviderEntity,
      );

    await messagingProviderRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteMessagingProviderAction>,
  ): Promise<void> {
    return;
  }
}
