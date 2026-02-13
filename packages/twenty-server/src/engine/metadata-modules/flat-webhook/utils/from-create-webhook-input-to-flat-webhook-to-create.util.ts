import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/create-webhook.input';
import { generateWebhookSecret } from 'src/engine/metadata-modules/webhook/utils/generate-webhook-secret.util';
import { type UniversalFlatWebhook } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-webhook.type';

export const fromCreateWebhookInputToFlatWebhookToCreate = ({
  createWebhookInput,
  flatApplication,
}: {
  createWebhookInput: CreateWebhookInput;
  flatApplication: FlatApplication;
}): UniversalFlatWebhook => {
  const now = new Date().toISOString();

  const { targetUrl, description } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createWebhookInput,
      ['targetUrl', 'description'],
    );

  const secret = createWebhookInput.secret ?? generateWebhookSecret();

  return {
    targetUrl,
    operations: createWebhookInput.operations,
    description: description ?? null,
    secret,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    universalIdentifier: v4(),
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
