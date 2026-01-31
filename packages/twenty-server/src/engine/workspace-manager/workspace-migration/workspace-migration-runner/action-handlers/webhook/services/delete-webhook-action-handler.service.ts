import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { FlatDeleteWebhookAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/types/workspace-migration-webhook-action.type';
import { WorkspaceMigrationActionRunnerContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteWebhookActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'webhook',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteWebhookAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const webhookRepository =
      queryRunner.manager.getRepository<WebhookEntity>(WebhookEntity);

    await webhookRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteWebhookAction>,
  ): Promise<void> {
    return;
  }
}
