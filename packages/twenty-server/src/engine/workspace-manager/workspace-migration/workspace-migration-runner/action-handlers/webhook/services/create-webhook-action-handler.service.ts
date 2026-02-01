import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { FlatCreateWebhookAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/types/workspace-migration-webhook-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateWebhookActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'webhook',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreateWebhookAction>,
  ): Promise<FlatCreateWebhookAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateWebhookAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const webhookRepository =
      queryRunner.manager.getRepository<WebhookEntity>(WebhookEntity);

    await webhookRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateWebhookAction>,
  ): Promise<void> {
    return;
  }
}
