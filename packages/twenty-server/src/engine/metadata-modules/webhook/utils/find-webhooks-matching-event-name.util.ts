import { isDefined } from 'twenty-shared/utils';

import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type FlatWebhookMaps } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook-maps.type';
import { WEBHOOK_WILDCARD_EXCLUDED_EVENT_NAMES } from 'src/engine/metadata-modules/webhook/constants/webhook-wildcard-excluded-event-names.constant';
import { isDatabaseEventTriggerListeningToEvent } from 'src/engine/workspace-event-emitter/utils/is-database-event-trigger-listening-to-event.util';

const isWebhookOperationMatchingEvent = ({
  operation,
  eventName,
}: {
  operation: string;
  eventName: string;
}): boolean => {
  if (WEBHOOK_WILDCARD_EXCLUDED_EVENT_NAMES.includes(eventName)) {
    return operation === eventName;
  }

  return isDatabaseEventTriggerListeningToEvent({
    triggerEventName: operation,
    eventName,
  });
};

export const findWebhooksMatchingEventName = ({
  flatWebhookMaps,
  eventName,
}: {
  flatWebhookMaps: FlatWebhookMaps;
  eventName: string;
}): FlatWebhook[] =>
  Object.values(flatWebhookMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((webhook) =>
      webhook.operations.some((operation) =>
        isWebhookOperationMatchingEvent({ operation, eventName }),
      ),
    );
