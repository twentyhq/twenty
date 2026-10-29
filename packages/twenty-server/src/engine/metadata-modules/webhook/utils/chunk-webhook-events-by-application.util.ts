import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';

export type WebhookEventsChunk<TWebhookEvent> = {
  applicationUniversalIdentifier: string;
  webhookEvents: TWebhookEvent[];
};

export const chunkWebhookEventsByApplication = <
  TWebhookEvent extends { webhookId: string },
>({
  webhookEvents,
  webhooks,
  chunkSize,
}: {
  webhookEvents: TWebhookEvent[];
  webhooks: Pick<FlatWebhook, 'id' | 'applicationUniversalIdentifier'>[];
  chunkSize: number;
}): WebhookEventsChunk<TWebhookEvent>[] => {
  const applicationUniversalIdentifierByWebhookId = new Map(
    webhooks.map((webhook) => [
      webhook.id,
      webhook.applicationUniversalIdentifier,
    ]),
  );
  const webhookEventsByApplication = new Map<string, TWebhookEvent[]>();

  for (const webhookEvent of webhookEvents) {
    const applicationUniversalIdentifier =
      applicationUniversalIdentifierByWebhookId.get(webhookEvent.webhookId);

    if (!isDefined(applicationUniversalIdentifier)) {
      continue;
    }

    webhookEventsByApplication.set(applicationUniversalIdentifier, [
      ...(webhookEventsByApplication.get(applicationUniversalIdentifier) ?? []),
      webhookEvent,
    ]);
  }

  return [...webhookEventsByApplication].flatMap(
    ([applicationUniversalIdentifier, applicationWebhookEvents]) =>
      chunk(applicationWebhookEvents, chunkSize).map((webhookEventsChunk) => ({
        applicationUniversalIdentifier,
        webhookEvents: webhookEventsChunk,
      })),
  );
};
