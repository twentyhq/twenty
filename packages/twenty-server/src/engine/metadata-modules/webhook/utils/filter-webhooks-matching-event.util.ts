import { isDefined } from 'twenty-shared/utils';

import { computeWebhookOperationsToMatch } from 'src/engine/metadata-modules/webhook/utils/compute-webhook-operations-to-match.util';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const filterWebhooksMatchingEvent = ({
  flatWebhookMaps,
  nameSingular,
  operation,
}: {
  flatWebhookMaps: WorkspaceCacheDataMap['flatWebhookMaps'];
  nameSingular: string;
  operation: string;
}) => {
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
