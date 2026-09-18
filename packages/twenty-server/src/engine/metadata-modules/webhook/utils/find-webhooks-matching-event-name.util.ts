import { isDefined } from 'twenty-shared/utils';

import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type FlatWebhookMaps } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook-maps.type';
import { computeWebhookOperationsToMatch } from 'src/engine/metadata-modules/webhook/utils/compute-webhook-operations-to-match.util';

export const findWebhooksMatchingEventName = ({
  flatWebhookMaps,
  eventName,
}: {
  flatWebhookMaps: FlatWebhookMaps;
  eventName: string;
}): FlatWebhook[] => {
  const [nameSingular, operation] = eventName.split('.');

  const operationsToMatch = computeWebhookOperationsToMatch({
    nameSingular,
    operation,
  });

  return Object.values(flatWebhookMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((webhook) =>
      operationsToMatch.some((operationToMatch) =>
        webhook.operations.includes(operationToMatch),
      ),
    );
};
