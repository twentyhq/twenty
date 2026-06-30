import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_WEBHOOK_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-webhook/constants/flat-webhook-editable-properties.constant';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type UpdateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/update-webhook.input';
import {
  WebhookException,
  WebhookExceptionCode,
} from 'src/engine/metadata-modules/webhook/webhook.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateWebhookInputToFlatWebhookToUpdateOrThrow = ({
  flatWebhookMaps,
  updateWebhookInput,
}: {
  flatWebhookMaps: FlatEntityMaps<FlatWebhook>;
  updateWebhookInput: UpdateWebhookInput;
}): FlatWebhook => {
  const existingFlatWebhook = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: updateWebhookInput.id,
    flatEntityMaps: flatWebhookMaps,
  });

  if (!isDefined(existingFlatWebhook)) {
    throw new WebhookException(
      'Webhook not found',
      WebhookExceptionCode.WEBHOOK_NOT_FOUND,
    );
  }

  return {
    ...mergeUpdateInExistingRecord({
      existing: existingFlatWebhook,
      properties: [...FLAT_WEBHOOK_EDITABLE_PROPERTIES],
      update: updateWebhookInput.update,
    }),
    updatedAt: new Date().toISOString(),
  };
};
