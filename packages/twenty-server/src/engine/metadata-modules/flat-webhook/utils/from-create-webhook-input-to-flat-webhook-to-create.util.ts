import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type CreateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/create-webhook.input';
import { generateWebhookSecret } from 'src/engine/metadata-modules/webhook/utils/generate-webhook-secret.util';

export const fromCreateWebhookInputToFlatWebhookToCreate = ({
  createWebhookInput,
  workspaceId,
  flatApplication,
}: {
  createWebhookInput: CreateWebhookInput;
  workspaceId: string;
  flatApplication: FlatApplication;
}): FlatWebhook => {
  const now = new Date().toISOString();

  const { targetUrl, description } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createWebhookInput,
      ['targetUrl', 'description'],
    );

  const id = createWebhookInput.id ?? v4();
  const secret = createWebhookInput.secret ?? generateWebhookSecret();

  return {
    id,
    targetUrl,
    operations: createWebhookInput.operations,
    description: description ?? null,
    secret,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    universalIdentifier: id,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
