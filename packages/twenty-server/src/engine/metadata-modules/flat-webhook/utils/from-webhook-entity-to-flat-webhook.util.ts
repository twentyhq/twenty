import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';

export const fromWebhookEntityToFlatWebhook = (
  webhookEntity: WebhookEntity,
): FlatWebhook => {
  return {
    id: webhookEntity.id,
    targetUrl: webhookEntity.targetUrl,
    operations: webhookEntity.operations,
    description: webhookEntity.description,
    secret: webhookEntity.secret,
    workspaceId: webhookEntity.workspaceId,
    universalIdentifier: webhookEntity.universalIdentifier,
    applicationId: webhookEntity.applicationId,
    createdAt: webhookEntity.createdAt.toISOString(),
    updatedAt: webhookEntity.updatedAt.toISOString(),
    deletedAt: webhookEntity.deletedAt?.toISOString() ?? null,
  };
};
