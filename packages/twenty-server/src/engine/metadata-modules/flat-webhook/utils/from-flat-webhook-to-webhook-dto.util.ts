import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type WebhookDTO } from 'src/engine/metadata-modules/webhook/dtos/webhook.dto';

export const fromFlatWebhookToWebhookDto = (
  flatWebhook: FlatWebhook,
): WebhookDTO => ({
  id: flatWebhook.id,
  targetUrl: flatWebhook.targetUrl,
  operations: flatWebhook.operations,
  description: flatWebhook.description,
  secret: flatWebhook.secret,
  workspaceId: flatWebhook.workspaceId,
  applicationId: flatWebhook.applicationId,
  createdAt: new Date(flatWebhook.createdAt),
  updatedAt: new Date(flatWebhook.updatedAt),
  deletedAt: flatWebhook.deletedAt ? new Date(flatWebhook.deletedAt) : null,
});
