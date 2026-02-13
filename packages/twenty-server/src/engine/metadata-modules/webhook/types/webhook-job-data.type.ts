import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

type WebhookJobBase = {
  targetUrl: string;
  eventName: string;
  workspaceId: string;
  webhookId: string;
  eventDate: Date;
  userId?: string;
  apiKeyId?: string;
  secret?: string;
};

export type CallWebhookJobData = WebhookJobBase & {
  objectMetadata: { id: string; nameSingular: string };
  workspaceMemberId?: string;
  applicationId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: any;
  updatedFields?: string[];
};

export type CallMetadataWebhookJobData = WebhookJobBase & {
  event: MetadataEvent;
};

export type WebhookJobData = CallWebhookJobData | CallMetadataWebhookJobData;
