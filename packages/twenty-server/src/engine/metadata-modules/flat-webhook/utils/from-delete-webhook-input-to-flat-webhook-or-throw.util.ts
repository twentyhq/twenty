import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import {
  WebhookException,
  WebhookExceptionCode,
} from 'src/engine/metadata-modules/webhook/webhook.exception';

export const fromDeleteWebhookInputToFlatWebhookOrThrow = ({
  flatWebhookMaps,
  webhookId,
}: {
  flatWebhookMaps: FlatEntityMaps<FlatWebhook>;
  webhookId: string;
}): FlatWebhook => {
  const existingFlatWebhook = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: webhookId,
    flatEntityMaps: flatWebhookMaps,
  });

  if (!isDefined(existingFlatWebhook)) {
    throw new WebhookException(
      'Webhook not found',
      WebhookExceptionCode.WEBHOOK_NOT_FOUND,
    );
  }

  return existingFlatWebhook;
};
