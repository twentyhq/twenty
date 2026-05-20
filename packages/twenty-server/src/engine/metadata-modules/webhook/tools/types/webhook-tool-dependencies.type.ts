import type { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';

export type WebhookToolDependencies = {
  webhookService: WebhookService;
};

export type WebhookToolContext = {
  workspaceId: string;
};
