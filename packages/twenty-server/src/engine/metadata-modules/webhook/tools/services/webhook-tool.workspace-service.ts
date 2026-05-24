import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';
import { createCreateWebhookTool } from 'src/engine/metadata-modules/webhook/tools/create-webhook.tool';
import { createDeleteWebhookTool } from 'src/engine/metadata-modules/webhook/tools/delete-webhook.tool';
import { createListWebhooksTool } from 'src/engine/metadata-modules/webhook/tools/list-webhooks.tool';
import { type WebhookToolDependencies } from 'src/engine/metadata-modules/webhook/tools/types/webhook-tool-dependencies.type';
import { createUpdateWebhookTool } from 'src/engine/metadata-modules/webhook/tools/update-webhook.tool';

@Injectable()
export class WebhookToolWorkspaceService {
  private readonly deps: WebhookToolDependencies;

  constructor(webhookService: WebhookService) {
    this.deps = { webhookService };
  }

  generateWebhookTools(workspaceId: string): ToolSet {
    const context = { workspaceId };

    const listWebhooks = createListWebhooksTool(this.deps, context);
    const createWebhook = createCreateWebhookTool(this.deps, context);
    const updateWebhook = createUpdateWebhookTool(this.deps, context);
    const deleteWebhook = createDeleteWebhookTool(this.deps, context);

    return {
      [listWebhooks.name]: listWebhooks,
      [createWebhook.name]: createWebhook,
      [updateWebhook.name]: updateWebhook,
      [deleteWebhook.name]: deleteWebhook,
    };
  }
}
