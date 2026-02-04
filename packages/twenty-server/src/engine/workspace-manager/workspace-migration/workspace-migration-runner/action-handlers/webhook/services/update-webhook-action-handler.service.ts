import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { FlatUpdateWebhookAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/types/workspace-migration-webhook-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateWebhookActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'webhook',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateWebhookAction>,
  ): Promise<FlatUpdateWebhookAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateWebhookAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const webhookRepository =
      queryRunner.manager.getRepository<WebhookEntity>(WebhookEntity);

    await webhookRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateWebhookAction>,
  ): Promise<void> {
    return;
  }
}
