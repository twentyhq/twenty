import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromWebhookEntityToFlatWebhook = ({
  entity: webhookEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'webhook'>): FlatWebhook => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(webhookEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${webhookEntity.applicationId} not found for webhook ${webhookEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

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
    applicationUniversalIdentifier,
  };
};
